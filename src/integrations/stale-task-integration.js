/**
 * Stale Task Integration
 *
 * Integrates stale task cleanup with the task management system.
 * Can be scheduled to run automatically or triggered by events.
 */

const StaleTaskCleanup = require('../utils/StaleTaskCleanup');
const fs = require('fs').promises;
const path = require('path');

class StaleTaskIntegration {
  constructor() {
    this.cleanup = new StaleTaskCleanup();
    this.initialized = false;
    this.scheduledTimer = null;

    // Integration configuration
    this.config = {
      autoRunEnabled: true,
      runInterval: 6 * 60 * 60 * 1000, // Run every 6 hours
      runOnStartup: true,
      quietMode: false, // Set to true to reduce console output

      // Trigger conditions
      triggers: {
        onTaskOverflow: true, // Run when too many assigned tasks
        onAgentInactive: true, // Run when agents go inactive
        maxAssignedTasks: 50 // Trigger if more than 50 assigned tasks
      }
    };
  }

  /**
   * Initialize the integration
   */
  async initialize() {
    try {
      await this.cleanup.initialize();
      this.initialized = true;

      if (!this.config.quietMode) {
        console.log('🔗 Stale Task Integration initialized');
      }

      // Run on startup if configured
      if (this.config.runOnStartup) {
        await this.runCleanup({ source: 'startup' });
      }

      // Schedule automatic runs
      if (this.config.autoRunEnabled) {
        this.scheduleAutomaticRuns();
      }
    } catch (error) {
      console.error('❌ Failed to initialize Stale Task Integration:', error);
      throw error;
    }
  }

  /**
   * Run stale task cleanup with integration features
   */
  async runCleanup(options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const { source = 'manual', dryRun = false } = options;

      if (!this.config.quietMode) {
        console.log(`🧹 Running stale task cleanup (triggered by: ${source})`);
      }

      // Check if cleanup is needed
      if (source !== 'forced' && !(await this.shouldRunCleanup())) {
        if (!this.config.quietMode) {
          console.log('ℹ️  Cleanup not needed at this time');
        }
        return { skipped: true, reason: 'not_needed' };
      }

      // Run the cleanup
      const originalDryRun = this.cleanup.config.actions.dryRun;
      this.cleanup.config.actions.dryRun = dryRun;

      const result = await this.cleanup.cleanup();

      // Restore original dry run setting
      this.cleanup.config.actions.dryRun = originalDryRun;

      // Post-cleanup actions
      if (result.cleaned > 0) {
        await this.notifyCleanupComplete(result, source);
      }

      // Update last run time
      await this.updateLastRun(result);

      return { ...result, source };
    } catch (error) {
      console.error('❌ Stale task cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Check if cleanup should run based on current conditions
   */
  async shouldRunCleanup() {
    try {
      // Load current state to check conditions
      const stateFile = path.join(__dirname, '../data/state.json');
      const stateData = await fs.readFile(stateFile, 'utf8');
      const state = JSON.parse(stateData);

      if (!state.tasks) return false;

      const tasks = Object.values(state.tasks);
      const assignedTasks = tasks.filter(
        task => task.assignee && task.assignee !== 'Unassigned'
      );

      // Check if we have too many assigned tasks
      if (
        this.config.triggers.onTaskOverflow &&
        assignedTasks.length > this.config.triggers.maxAssignedTasks
      ) {
        return true;
      }

      // Check for very old assigned tasks
      const now = new Date();
      const veryOldTasks = assignedTasks.filter(task => {
        const lastUpdate = task.lastUpdated ? new Date(task.lastUpdated) : null;
        if (!lastUpdate) return false;

        const ageHours =
          (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        return ageHours > 48; // Consider 48+ hour old tasks as definitely needing cleanup
      });

      return veryOldTasks.length > 0;
    } catch (error) {
      console.warn(
        'Warning: Could not check cleanup conditions:',
        error.message
      );
      return true; // Default to running cleanup if we can't check
    }
  }

  /**
   * Schedule automatic cleanup runs
   */
  scheduleAutomaticRuns() {
    if (this.scheduledTimer) {
      clearInterval(this.scheduledTimer);
    }

    this.scheduledTimer = setInterval(async () => {
      try {
        await this.runCleanup({ source: 'scheduled' });
      } catch (error) {
        console.error('Scheduled cleanup failed:', error);
      }
    }, this.config.runInterval);

    if (!this.config.quietMode) {
      const intervalHours = this.config.runInterval / (1000 * 60 * 60);
      console.log(
        `⏰ Scheduled automatic cleanup every ${intervalHours} hours`
      );
    }
  }

  /**
   * Trigger cleanup when specific events occur
   */
  async onTaskAssigned(taskId, agentId) {
    // Could trigger cleanup if too many tasks are assigned
    if (this.config.triggers.onTaskOverflow) {
      const stateFile = path.join(__dirname, '../data/state.json');
      try {
        const stateData = await fs.readFile(stateFile, 'utf8');
        const state = JSON.parse(stateData);
        const assignedCount = Object.values(state.tasks || {}).filter(
          task => task.assignee && task.assignee !== 'Unassigned'
        ).length;

        if (assignedCount > this.config.triggers.maxAssignedTasks) {
          await this.runCleanup({ source: 'task_overflow' });
        }
      } catch (error) {
        console.warn('Could not check task overflow condition:', error.message);
      }
    }
  }

  /**
   * Trigger cleanup when an agent becomes inactive
   */
  async onAgentInactive(agentId, inactiveDuration) {
    if (
      this.config.triggers.onAgentInactive &&
      inactiveDuration > 24 * 60 * 60 * 1000
    ) {
      // Agent has been inactive for more than 24 hours
      await this.runCleanup({ source: 'agent_inactive', agentId });
    }
  }

  /**
   * Manual trigger for cleanup with options
   */
  async manualCleanup(options = {}) {
    const { force = false, dryRun = false } = options;

    return await this.runCleanup({
      source: force ? 'forced' : 'manual',
      dryRun
    });
  }

  /**
   * Get integration statistics
   */
  async getStats() {
    const cleanupStats = await this.cleanup.getStats(30);
    const lastRun = await this.getLastRun();

    return {
      integration: {
        autoRunEnabled: this.config.autoRunEnabled,
        runInterval: this.config.runInterval / (1000 * 60 * 60), // hours
        lastRun: lastRun?.timestamp || null,
        lastResult: lastRun?.result || null
      },
      cleanup: cleanupStats
    };
  }

  /**
   * Send notifications about cleanup completion
   */
  async notifyCleanupComplete(result, source) {
    if (result.cleaned === 0) return;

    const notification = {
      type: 'stale_task_cleanup_complete',
      source,
      tasksProcessed: result.processed,
      tasksCleaned: result.cleaned,
      errors: result.errors,
      timestamp: new Date().toISOString()
    };

    // This could be extended to send to Slack, email, etc.
    if (!this.config.quietMode) {
      console.log(
        `📧 Cleanup notification: ${result.cleaned} tasks cleaned from ${source} trigger`
      );
    }

    // Save notification to log
    await this.cleanup.log(
      'NOTIFICATION',
      `Cleanup completed: ${JSON.stringify(notification)}`
    );
  }

  /**
   * Update last run information
   */
  async updateLastRun(result) {
    const lastRunFile = path.join(
      __dirname,
      '../data/stale-cleanup-last-run.json'
    );
    const lastRun = {
      timestamp: new Date().toISOString(),
      result
    };

    try {
      await fs.writeFile(lastRunFile, JSON.stringify(lastRun, null, 2));
    } catch (error) {
      console.warn('Could not save last run info:', error.message);
    }
  }

  /**
   * Get last run information
   */
  async getLastRun() {
    const lastRunFile = path.join(
      __dirname,
      '../data/stale-cleanup-last-run.json'
    );
    try {
      const data = await fs.readFile(lastRunFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Shutdown the integration
   */
  async shutdown() {
    if (this.scheduledTimer) {
      clearInterval(this.scheduledTimer);
    }

    if (!this.config.quietMode) {
      console.log('🔗 Stale Task Integration shutdown complete');
    }
  }
}

// Singleton instance for global use
let integrationInstance = null;

/**
 * Get or create the global integration instance
 */
async function getIntegration() {
  if (!integrationInstance) {
    integrationInstance = new StaleTaskIntegration();
    await integrationInstance.initialize();
  }
  return integrationInstance;
}

/**
 * Helper functions for easy integration
 */
async function runCleanup(options = {}) {
  const integration = await getIntegration();
  return integration.runCleanup(options);
}

async function manualCleanup(options = {}) {
  const integration = await getIntegration();
  return integration.manualCleanup(options);
}

async function getStats() {
  const integration = await getIntegration();
  return integration.getStats();
}

async function onTaskAssigned(taskId, agentId) {
  const integration = await getIntegration();
  return integration.onTaskAssigned(taskId, agentId);
}

async function onAgentInactive(agentId, inactiveDuration) {
  const integration = await getIntegration();
  return integration.onAgentInactive(agentId, inactiveDuration);
}

module.exports = {
  StaleTaskIntegration,
  getIntegration,
  runCleanup,
  manualCleanup,
  getStats,
  onTaskAssigned,
  onAgentInactive
};
