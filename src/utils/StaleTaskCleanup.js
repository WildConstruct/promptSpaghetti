#!/usr/bin/env node

/**
 * Stale Task Cleanup Utility
 *
 * Identifies and automatically reassigns tasks that have been assigned
 * but haven't been updated in more than 24 hours back to the available pool.
 *
 * Features:
 * - Configurable stale timeout (default 24 hours)
 * - Dry-run mode for testing
 * - Detailed logging and notifications
 * - Integration with task management system
 * - Optional grace periods for different task types
 */

const fs = require('fs').promises;
const path = require('path');

class StaleTaskCleanup {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.stateFile = path.join(this.dataDir, 'state.json');
    this.configFile = path.join(this.dataDir, 'stale-cleanup-config.json');
    this.logFile = path.join(this.dataDir, 'stale-cleanup.log');

    // Default configuration
    this.config = {
      // Stale timeouts by status (in hours)
      staleTimeouts: {
        IN_PROGRESS: 4, // 4 hours for in-progress tasks (autonomous agents work quickly)
        ASSIGNED: 4, // 4 hours for newly assigned tasks (should start immediately)
        REVIEW: 48, // 48 hours for review tasks (longer grace period)
        BLOCKED: 72 // 72 hours for blocked tasks (even longer)
      },

      // Grace periods for different task types/priorities
      gracePeriods: {
        high: 6, // High priority gets 6 extra hours
        medium: 0, // No extra time for medium
        low: -6 // Low priority gets 6 hours less (18 hours total)
      },

      // Actions to take
      actions: {
        reassignToAvailable: true,
        notifyOriginalAssignee: true,
        logDetailed: true,
        dryRun: false
      },

      // Exclusions
      exclusions: {
        // Skip tasks with these patterns in title/description
        skipPatterns: ['URGENT', 'HOTFIX', 'CRITICAL', 'PRODUCTION'],

        // Skip specific agents (e.g., long-running bots)
        skipAgents: ['build-bot', 'deploy-agent', 'monitoring-service']
      }
    };

    this.initialized = false;
  }

  /**
   * Initialize the cleanup utility
   */
  async initialize() {
    try {
      await this.ensureDataDirectory();
      await this.loadConfig();

      this.initialized = true;
      console.log('✅ Stale Task Cleanup utility initialized');

      await this.log('SYSTEM', 'Stale task cleanup utility initialized');
    } catch {
      console.error('❌ Failed to initialize Stale Task Cleanup');
      throw new Error('Initialization failed');
    }
  }

  /**
   * Run the stale task cleanup process
   */
  async cleanup(options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log('🧹 Starting stale task cleanup...');

      // Load current state
      const state = await this.loadState();
      if (!state || !state.tasks) {
        console.log('ℹ️  No tasks found in state file');
        return { processed: 0, cleaned: 0, errors: 0 };
      }

      const tasks = Object.entries(state.tasks);
      const staleTask = this.findStaleTasks(tasks);

      console.log(
        `📊 Found ${staleTask.length} stale tasks out of ${tasks.length} total tasks`
      );

      if (staleTask.length === 0) {
        console.log('✅ No stale tasks found - all tasks are current');
        return { processed: tasks.length, cleaned: 0, errors: 0 };
      }

      // Show stale tasks
      this.displayStaleTasks(staleTask);

      let cleanedCount = 0;
      let errorCount = 0;

      const { dryRun = this.config.actions.dryRun } = options;
      const isDryRun = dryRun;

      if (isDryRun) {
        console.log('\n🔍 DRY RUN MODE - No changes will be made');
        await this.log(
          'INFO',
          `Dry run: found ${staleTask.length} stale tasks`
        );
      } else {
        console.log(`\n🔄 Processing ${staleTask.length} stale tasks...`);

        for (const { taskId, task, staleDuration } of staleTask) {
          try {
            await this.cleanupStaleTask(taskId, task, staleDuration);
            cleanedCount++;
            console.log(`✅ Cleaned up task ${taskId}`);
          } catch {
            errorCount++;
            console.error(
              `❌ Failed to cleanup task ${taskId}`
            );
            await this.log(
              'ERROR',
              `Failed to cleanup task ${taskId}`
            );
          }
        }

        // Save updated state
        await this.saveState(state);
        console.log(`✅ Updated state file with ${cleanedCount} cleaned tasks`);
      }

      const summary = {
        processed: tasks.length,
        cleaned: cleanedCount,
        errors: errorCount,
        staleTasks: staleTask.length
      };

      await this.log('SUMMARY', `Cleanup complete: ${JSON.stringify(summary)}`);
      console.log('\n📊 Cleanup Summary:', summary);

      return summary;
    } catch {
      console.error('❌ Cleanup process failed');
      await this.log('ERROR', 'Cleanup process failed');
      throw new Error('Cleanup process failed');
    }
  }

  /**
   * Find tasks that are stale based on configuration
   */
  findStaleTasks(tasks) {
    const staleTask = [];
    const now = new Date();

    for (const [taskId, task] of tasks) {
      // Skip if not assigned or no assignee
      if (!task.assignee || task.assignee === 'Unassigned') {
        continue;
      }

      // Skip if in excluded states
      if (!this.config.staleTimeouts[task.state]) {
        continue;
      }

      // Skip if matches exclusion patterns
      if (this.shouldSkipTask(task)) {
        continue;
      }

      // Calculate stale threshold for this task
      const staleThresholdHours = this.calculateStaleThreshold(task);
      const staleThresholdMs = staleThresholdHours * 60 * 60 * 1000;

      // Get last update time
      const lastUpdate = this.getLastUpdateTime(task);
      if (!lastUpdate) {
        continue; // Skip if we can't determine last update
      }

      const timeSinceUpdate = now.getTime() - lastUpdate.getTime();

      if (timeSinceUpdate > staleThresholdMs) {
        staleTask.push({
          taskId,
          task,
          lastUpdate,
          staleDuration: timeSinceUpdate,
          thresholdHours: staleThresholdHours
        });
      }
    }

    // Sort by staleness (most stale first)
    staleTask.sort((a, b) => b.staleDuration - a.staleDuration);

    return staleTask;
  }

  /**
   * Check if a task should be skipped based on exclusion rules
   */
  shouldSkipTask(task) {
    // Check skip patterns
    const textToCheck =
      `${task.title || ''} ${task.description || ''}`.toLowerCase();
    for (const pattern of this.config.exclusions.skipPatterns) {
      if (textToCheck.includes(pattern.toLowerCase())) {
        return true;
      }
    }

    // Check skip agents
    if (this.config.exclusions.skipAgents.includes(task.assignee)) {
      return true;
    }

    return false;
  }

  /**
   * Calculate stale threshold for a specific task
   */
  calculateStaleThreshold(task) {
    const baseTimeout = this.config.staleTimeouts[task.state] || 24;
    const gracePeriod = this.config.gracePeriods[task.priority] || 0;

    return Math.max(1, baseTimeout + gracePeriod); // Minimum 1 hour
  }

  /**
   * Get the last update time for a task
   */
  getLastUpdateTime(task) {
    // Try various timestamp fields
    const timeFields = [
      'lastUpdated',
      'lastModified',
      'updatedAt',
      'assignedAt',
      'created'
    ];

    for (const field of timeFields) {
      if (task[field]) {
        const date = new Date(task[field]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  }

  /**
   * Display stale tasks in a formatted table
   */
  displayStaleTasks(staleTask) {
    if (staleTask.length === 0) {return;}

    console.log('\n📋 STALE TASKS FOUND:');
    console.log('═'.repeat(100));
    console.log(
      'ID'.padEnd(20) +
        'Assignee'.padEnd(15) +
        'State'.padEnd(12) +
        'Stale/Limit'.padEnd(12) +
        'Title'.padEnd(35)
    );
    console.log('-'.repeat(100));

    for (const { taskId, task, staleDuration, thresholdHours } of staleTask) {
      const staleHours = Math.floor(staleDuration / (1000 * 60 * 60));
      const staleDays = Math.floor(staleHours / 24);
      const staleDisplay =
        staleDays > 0 ? `${staleDays}d ${staleHours % 24}h` : `${staleHours}h`;
      const thresholdLabel =
        typeof thresholdHours === 'number'
          ? `${staleDisplay}/${Math.round(thresholdHours)}h`
          : staleDisplay;

      console.log(
        taskId.padEnd(20) +
          (task.assignee || 'Unknown').padEnd(15) +
          (task.state || 'Unknown').padEnd(12) +
          thresholdLabel.padEnd(12) +
          (task.title || 'No title').substring(0, 34).padEnd(35)
      );
    }
    console.log('═'.repeat(100));
  }

  /**
   * Clean up a specific stale task
   */
  async cleanupStaleTask(taskId, task, staleDuration) {
    const originalAssignee = task.assignee;
    const staleHours = Math.floor(staleDuration / (1000 * 60 * 60));

    // Record the cleanup action
    const cleanupRecord = {
      taskId,
      originalAssignee,
      originalState: task.state,
      staleHours,
      cleanupTime: new Date().toISOString(),
      reason: 'Stale task cleanup - no activity for 24+ hours'
    };

    // Update task
    task.assignee = 'Unassigned';
    task.state = 'TODO'; // Reset to available state
    task.lastUpdated = new Date().toISOString();

    // Add cleanup note to task
    if (!task.notes) {task.notes = [];}
    task.notes.push(
      `[AUTOMATED] Task reassigned due to inactivity (${staleHours}h stale) - was assigned to ${originalAssignee}`
    );

    // Log the action
    await this.log(
      'CLEANUP',
      `Task ${taskId} reassigned from ${originalAssignee} (stale for ${staleHours}h)`
    );

    // Notify if enabled
    if (this.config.actions.notifyOriginalAssignee) {
      await this.notifyAssignee(originalAssignee, taskId, task, staleHours);
    }

    return cleanupRecord;
  }

  /**
   * Send notification to original assignee
   */
  async notifyAssignee(assignee, taskId, task, staleHours) {
    try {
      // This could be extended to send actual notifications (email, Slack, etc.)
      const notification = {
        to: assignee,
        type: 'stale_task_reassignment',
        taskId,
        taskTitle: task.title,
        staleHours,
        message: `Task ${taskId} ("${task.title}") has been reassigned due to ${staleHours} hours of inactivity. If you were still working on this task, please reassign it to yourself.`,
        timestamp: new Date().toISOString()
      };

      // For now, just log the notification
      await this.log(
        'NOTIFICATION',
        `Notification queued for ${assignee}: ${notification.message}`
      );
      console.log(
        `📧 Notification queued for ${assignee} about task ${taskId}`
      );
    } catch {
      console.warn(`⚠️  Failed to notify ${assignee}`);
    }
  }

  /**
   * Get cleanup statistics and history
   */
  async getStats(days = 7) {
    try {
      const logs = await this.getLogs(days);
      const cleanupEvents = logs.filter(log => log.type === 'CLEANUP');

      const stats = {
        period: `${days} days`,
        totalCleanups: cleanupEvents.length,
        affectedAgents: [
          ...new Set(
            cleanupEvents
              .map(event => event.message.match(/from (\w+)/)?.[1])
              .filter(Boolean)
          )
        ],
        avgStaleHours:
          cleanupEvents.length > 0
            ? cleanupEvents.reduce((sum, event) => {
                const hours = event.message.match(/\((\d+)h stale\)/)?.[1];
                return sum + (parseInt(hours) || 0);
              }, 0) / cleanupEvents.length
            : 0
      };

      return stats;
    } catch {
      console.error('Error getting cleanup stats');
      return null;
    }
  }

  // Utility methods

  async ensureDataDirectory() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      this.config = { ...this.config, ...JSON.parse(configData) };
    } catch {
      // Use defaults, save initial config
      await this.saveConfig();
    }
  }

  async saveConfig() {
    await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2));
  }

  async loadState() {
    try {
      const stateData = await fs.readFile(this.stateFile, 'utf8');
      return JSON.parse(stateData);
    } catch {
      console.warn('⚠️  Could not load state file');
      return null;
    }
  }

  async saveState(state) {
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }

  async log(type, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message
    };

    try {
      const logLine = `${logEntry.timestamp} [${logEntry.type}] ${logEntry.message}\n`;
      await fs.appendFile(this.logFile, logLine);
    } catch {
      console.warn('Failed to write to log file');
    }

    if (this.config.actions.logDetailed) {
      console.log(`[${type}] ${message}`);
    }
  }

  async getLogs(days = 7) {
    try {
      const logContent = await fs.readFile(this.logFile, 'utf8');
      const lines = logContent.trim().split('\n').filter(Boolean);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      return lines
        .map(line => {
          const match = line.match(/^(.+?) \[(.+?)\] (.+)$/);
          if (!match) {return null;}

          return {
            timestamp: new Date(match[1]),
            type: match[2],
            message: match[3]
          };
        })
        .filter(log => log && log.timestamp >= cutoffDate);
    } catch {
      return [];
    }
  }

  /**
   * Run interactive mode for testing and configuration
   */
  async interactive() {
    console.log('🔧 Interactive Stale Task Cleanup Mode\n');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const ask = question =>
      new Promise(resolve => rl.question(question, resolve));

    try {
      console.log('Current configuration:');
      console.log(
        `- Stale timeout for IN_PROGRESS: ${this.config.staleTimeouts.IN_PROGRESS} hours`
      );
      console.log(`- Dry run mode: ${this.config.actions.dryRun}`);

      const action = await ask(
        '\nChoose action: (c)leanup, (s)tats, (d)ry-run, (q)uit: '
      );

      switch (action.toLowerCase()) {
        case 'c':
          this.config.actions.dryRun = false;
          await this.cleanup();
          break;
        case 's':
          const stats = await this.getStats();
          console.log('\n📊 Cleanup Statistics:', stats);
          break;
        case 'd':
          this.config.actions.dryRun = true;
          await this.cleanup();
          break;
        case 'q':
          console.log('👋 Goodbye!');
          break;
        default:
          console.log('❌ Invalid option');
      }
    } finally {
      rl.close();
    }
  }
}

// CLI mode
if (require.main === module) {
  const cleanup = new StaleTaskCleanup();

  const args = process.argv.slice(2);
  const command = args[0];

  const run = async () => {
    switch (command) {
        case 'cleanup':
        case 'clean':
          await cleanup.cleanup();
          break;
        case 'dry-run':
        case 'dryrun':
          cleanup.config.actions.dryRun = true;
          await cleanup.cleanup();
          break;
        case 'stats':
          const days = parseInt(args[1]) || 7;
          const stats = await cleanup.getStats(days);
          console.log('📊 Cleanup Statistics:', stats);
          break;
        case 'interactive':
        case 'i':
          await cleanup.interactive();
          break;
        case 'help':
        default:
          console.log(`
🧹 Stale Task Cleanup Utility

USAGE:
  node StaleTaskCleanup.js <command> [options]

COMMANDS:
  cleanup          Run stale task cleanup (live mode)
  dry-run          Run in dry-run mode (no changes)
  stats [days]     Show cleanup statistics for last N days (default: 7)
  interactive      Interactive mode for testing
  help             Show this help

EXAMPLES:
  node StaleTaskCleanup.js dry-run       # Test without making changes
  node StaleTaskCleanup.js cleanup       # Clean up stale tasks
  node StaleTaskCleanup.js stats 30      # Show 30-day statistics
  node StaleTaskCleanup.js interactive   # Interactive mode

CONFIGURATION:
  Edit src/data/stale-cleanup-config.json to customize:
  - Stale timeouts by task state
  - Grace periods by priority
  - Exclusion patterns and agents
  - Notification settings
`);
          break;
    }
  };

  run().catch(error => {
    console.error('Stale Task Cleanup failed:', error);
    process.exitCode = 1;
  });
}

module.exports = StaleTaskCleanup;
