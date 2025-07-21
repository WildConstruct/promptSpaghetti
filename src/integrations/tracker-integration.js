/**
 * Daily Ticket Tracker Integration
 * 
 * Integrates the Daily Ticket Tracker with existing task management systems.
 * Automatically tracks ticket approvals and pushes from various sources.
 */

const DailyTicketTracker = require('../utils/DailyTicketTracker');
const fs = require('fs').promises;
const path = require('path');

class TrackerIntegration {
  constructor() {
    this.tracker = new DailyTicketTracker();
    this.initialized = false;
    this.watchedFiles = new Map(); // File -> last modified time
    this.watchInterval = null;
    
    // Integration sources
    this.sources = {
      stateFile: path.join(__dirname, '../data/state.json'),
      commitFile: path.join(__dirname, '../data/commit-tracking.json'),
      qaFile: path.join(__dirname, '../data/qa-results.json')
    };
  }

  /**
   * Initialize integration
   */
  async initialize() {
    try {
      await this.tracker.initialize();
      this.initialized = true;
      
      console.log('🔗 Tracker integration initialized');
      
      // Start watching for changes
      await this.startWatching();
      
    } catch (error) {
      console.error('❌ Failed to initialize tracker integration:', error);
      throw error;
    }
  }

  /**
   * Start watching task management files for changes
   */
  async startWatching() {
    // Initial scan
    await this.scanForChanges();
    
    // Set up periodic scanning (every 30 seconds)
    this.watchInterval = setInterval(async () => {
      try {
        await this.scanForChanges();
      } catch (error) {
        console.error('Error scanning for changes:', error);
      }
    }, 30000);
    
    console.log('👀 Started watching task management files...');
  }

  /**
   * Scan for changes in task management files
   */
  async scanForChanges() {
    for (const [name, filePath] of Object.entries(this.sources)) {
      try {
        const stats = await fs.stat(filePath);
        const lastModified = stats.mtime.getTime();
        
        if (this.watchedFiles.has(filePath)) {
          const previousModified = this.watchedFiles.get(filePath);
          if (lastModified > previousModified) {
            await this.processFileChange(name, filePath);
          }
        }
        
        this.watchedFiles.set(filePath, lastModified);
        
      } catch (error) {
        // File might not exist yet, that's okay
        if (error.code !== 'ENOENT') {
          console.warn(`Warning: Could not check ${filePath}:`, error.message);
        }
      }
    }
  }

  /**
   * Process changes in task management files
   */
  async processFileChange(source, filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);
      
      switch (source) {
        case 'stateFile':
          await this.processStateChanges(parsed);
          break;
        case 'commitFile':
          await this.processCommitChanges(parsed);
          break;
        case 'qaFile':
          await this.processQAChanges(parsed);
          break;
      }
      
    } catch (error) {
      console.error(`Error processing ${source} changes:`, error);
    }
  }

  /**
   * Process state.json changes for task approvals
   */
  async processStateChanges(stateData) {
    if (!stateData.tasks) return;
    
    // Look for newly approved tasks
    for (const [taskId, task] of Object.entries(stateData.tasks)) {
      if (task.status === 'APPROVED' && !task.trackedApproval) {
        await this.tracker.trackApproval(
          taskId,
          task.assignedTo || task.lastUpdatedBy || 'unknown',
          {
            story: task.story,
            estimate: task.estimate,
            type: task.wipClass,
            approvedAt: task.lastUpdated
          }
        );
        
        // Mark as tracked (this won't persist to file, just prevents double-tracking)
        task.trackedApproval = true;
        
        console.log(`📋 Auto-tracked approval: ${taskId}`);
      }
    }
  }

  /**
   * Process commit-tracking.json changes for pushes
   */
  async processCommitChanges(commitData) {
    if (!commitData.commits) return;
    
    // Look for new commits
    for (const commit of commitData.commits) {
      if (!commit.trackedPush && commit.tasks && commit.tasks.length > 0) {
        await this.tracker.trackPush(
          commit.tasks,
          commit.author || 'unknown',
          commit.hash || commit.id,
          {
            message: commit.message,
            timestamp: commit.timestamp,
            branch: commit.branch
          }
        );
        
        // Mark as tracked
        commit.trackedPush = true;
        
        console.log(`🚀 Auto-tracked push: ${commit.tasks.length} task(s) in ${commit.hash}`);
      }
    }
  }

  /**
   * Process qa-results.json changes for additional tracking
   */
  async processQAChanges(qaData) {
    // This could track QA approvals as a separate metric
    // For now, we'll just log QA activity
    if (qaData.lastRun) {
      const lastRun = new Date(qaData.lastRun);
      const now = new Date();
      
      // If QA ran in the last minute, it's probably new
      if (now.getTime() - lastRun.getTime() < 60000) {
        console.log(`🔍 QA activity detected: ${qaData.passed || 0} passed, ${qaData.failed || 0} failed`);
      }
    }
  }

  /**
   * Manual tracking methods for external integrations
   */
  async trackTaskApproval(taskId, agentId, metadata = {}) {
    if (!this.initialized) {
      console.warn('Tracker not initialized, skipping approval tracking');
      return;
    }
    
    await this.tracker.trackApproval(taskId, agentId, metadata);
  }

  async trackTaskPush(taskIds, agentId, commitHash, metadata = {}) {
    if (!this.initialized) {
      console.warn('Tracker not initialized, skipping push tracking');
      return;
    }
    
    await this.tracker.trackPush(taskIds, agentId, commitHash, metadata);
  }

  /**
   * Integration with grab-tasks.js
   */
  async onTaskGrabbed(taskId, agentId) {
    // Could track task assignments if needed
    console.log(`📝 Task grabbed: ${taskId} by ${agentId}`);
  }

  /**
   * Integration with finish-task.js
   */
  async onTaskFinished(taskId, agentId) {
    // Track task completion
    await this.trackTaskApproval(taskId, agentId, {
      source: 'finish-task',
      completedAt: new Date()
    });
  }

  /**
   * Integration with run-qa-agent.js
   */
  async onQAComplete(results) {
    if (results.approvedTasks && results.approvedTasks.length > 0) {
      for (const taskId of results.approvedTasks) {
        await this.trackTaskApproval(taskId, 'qa-agent', {
          source: 'qa-approval',
          qaResults: results
        });
      }
    }
  }

  /**
   * Get current statistics
   */
  getCurrentStats() {
    if (!this.initialized) return null;
    return this.tracker.getCurrentStats();
  }

  /**
   * Generate report
   */
  async generateReport(includeTimeline = false) {
    if (!this.initialized) return null;
    return await this.tracker.generateDailyReport(includeTimeline);
  }

  /**
   * Shutdown integration
   */
  async shutdown() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
    }
    
    if (this.tracker) {
      await this.tracker.shutdown();
    }
    
    console.log('🔗 Tracker integration shutdown complete');
  }
}

// Singleton instance for global use
let integrationInstance = null;

/**
 * Get or create the global integration instance
 */
async function getIntegration() {
  if (!integrationInstance) {
    integrationInstance = new TrackerIntegration();
    await integrationInstance.initialize();
  }
  return integrationInstance;
}

/**
 * Helper functions for easy integration
 */
async function trackApproval(taskId, agentId, metadata = {}) {
  const integration = await getIntegration();
  return integration.trackTaskApproval(taskId, agentId, metadata);
}

async function trackPush(taskIds, agentId, commitHash, metadata = {}) {
  const integration = await getIntegration();
  return integration.trackTaskPush(taskIds, agentId, commitHash, metadata);
}

async function getStats() {
  const integration = await getIntegration();
  return integration.getCurrentStats();
}

async function generateReport(includeTimeline = false) {
  const integration = await getIntegration();
  return integration.generateReport(includeTimeline);
}

module.exports = {
  TrackerIntegration,
  getIntegration,
  trackApproval,
  trackPush,
  getStats,
  generateReport
};