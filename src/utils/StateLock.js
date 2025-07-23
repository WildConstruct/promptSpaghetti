/**
 * State Management Locking Utility
 * Prevents race conditions when multiple automation scripts access state.json concurrently
 */

const fs = require('fs');
const path = require('path');
const lockfile = require('proper-lockfile');

class StateLock {
  constructor(stateFilePath = null) {
    this.stateFilePath = stateFilePath || path.join(__dirname, '..', 'data', 'state.json');
    this.lockFilePath = this.stateFilePath + '.lock';
    this.maxRetries = 10;
    this.retryDelay = { min: 100, max: 1000 };
    this.staleTimeout = 30000; // 30 seconds
  }

  /**
     * Acquire exclusive lock on state file
     * @returns {Promise<Function>} Release function
     */
  async acquireLock() {
    try {
      const release = await lockfile.lock(this.stateFilePath, {
        retries: {
          retries: this.maxRetries,
          minTimeout: this.retryDelay.min,
          maxTimeout: this.retryDelay.max
        },
        stale: this.staleTimeout
      });

      return release;
    } catch (error) {
      if (error.code === 'ELOCKED') {
        throw new Error('State file is locked by another process. Try again in a few seconds.');
      }
      throw new Error(`Failed to acquire state lock: ${error.message}`);
    }
  }

  /**
     * Read state with automatic locking
     * @returns {Promise<Object>} State object
     */
  async readState() {
    const release = await this.acquireLock();
    try {
      if (!fs.existsSync(this.stateFilePath)) {
        throw new Error(`State file not found: ${this.stateFilePath}`);
      }

      const stateData = fs.readFileSync(this.stateFilePath, 'utf8');
      return JSON.parse(stateData);
    } finally {
      release();
    }
  }

  /**
     * Write state with automatic locking and atomic operations
     * @param {Object} state - State object to write
     * @returns {Promise<void>}
     */
  async writeState(state) {
    const release = await this.acquireLock();
    try {
      // Update metadata
      if (!state.meta) state.meta = {};
      state.meta.updated = new Date().toISOString();

      // Atomic write using temporary file
      const tempPath = this.stateFilePath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(state, null, 2));
      fs.renameSync(tempPath, this.stateFilePath);
    } finally {
      release();
    }
  }

  /**
     * Perform atomic transaction on state
     * @param {Function} transaction - Function that modifies state: (state) => void
     * @returns {Promise<Object>} Updated state
     */
  async transaction(transaction) {
    const release = await this.acquireLock();
    try {
      // Read current state
      let state;
      if (!fs.existsSync(this.stateFilePath)) {
        state = { meta: { cycle: 1 }, tasks: {}, assignments: {} };
      } else {
        const stateData = fs.readFileSync(this.stateFilePath, 'utf8');
        state = JSON.parse(stateData);
      }

      // Apply transaction
      const result = transaction(state);

      // Update metadata
      if (!state.meta) state.meta = {};
      state.meta.updated = new Date().toISOString();

      // Atomic write
      const tempPath = this.stateFilePath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(state, null, 2));
      fs.renameSync(tempPath, this.stateFilePath);

      return result || state;
    } finally {
      release();
    }
  }

  /**
     * Update a specific task with locking
     * @param {string} taskId - Task ID to update
     * @param {Function|Object} updates - Function or object with updates
     * @returns {Promise<Object>} Updated task
     */
  async updateTask(taskId, updates) {
    return this.transaction(state => {
      if (!state.tasks[taskId]) {
        throw new Error(`Task ${taskId} not found`);
      }

      const task = state.tasks[taskId];

      if (typeof updates === 'function') {
        updates(task);
      } else {
        Object.assign(task, updates);
      }

      task.updated = new Date().toISOString();
      return task;
    });
  }

  /**
     * Clear task assignment with locking
     * @param {string} taskId - Task ID to clear assignment for
     * @param {string} assignee - Agent to clear assignment from
     * @returns {Promise<boolean>} True if assignment was cleared
     */
  async clearTaskAssignment(taskId, assignee = null) {
    return this.transaction(state => {
      const task = state.tasks[taskId];
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      const agentId = assignee || task.assignee;
      if (!agentId || !state.assignments) {
        return false;
      }

      const assignments = state.assignments[agentId];
      if (!assignments) {
        return false;
      }

      // Handle both array and comma-separated string formats
      const taskList = Array.isArray(assignments) 
        ? assignments.filter(id => id !== taskId)
        : assignments.split(',').filter(id => id !== taskId);

      if (taskList.length === 0) {
        delete state.assignments[agentId];
      } else {
        state.assignments[agentId] = taskList;
      }

      return true;
    });
  }

  /**
     * Assign task to agent with locking
     * @param {string} taskId - Task ID to assign
     * @param {string} agentId - Agent ID to assign to
     * @returns {Promise<boolean>} True if assignment was successful
     */
  async assignTask(taskId, agentId) {
    return this.transaction(state => {
      const task = state.tasks[taskId];
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      // Update task assignment
      task.assignee = agentId;
      task.updated = new Date().toISOString();

      // Update assignments tracking
      if (!state.assignments) state.assignments = {};
      if (!state.assignments[agentId]) {
        state.assignments[agentId] = [];
      }

      // Ensure assignments is always an array
      if (!Array.isArray(state.assignments[agentId])) {
        state.assignments[agentId] = state.assignments[agentId].split(',');
      }

      // Add task if not already assigned
      if (!state.assignments[agentId].includes(taskId)) {
        state.assignments[agentId].push(taskId);
      }

      return true;
    });
  }

  /**
     * Get current lock status for debugging
     * @returns {Object} Lock status information
     */
  getLockStatus() {
    try {
      const lockExists = fs.existsSync(this.lockFilePath);
      let lockInfo = { exists: lockExists };

      if (lockExists) {
        const stats = fs.statSync(this.lockFilePath);
        const age = Date.now() - stats.mtime.getTime();
        lockInfo.age = age;
        lockInfo.stale = age > this.staleTimeout;
      }

      return lockInfo;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
     * Force remove stale lock (use with caution!)
     * @returns {boolean} True if lock was removed
     */
  forceUnlock() {
    try {
      if (fs.existsSync(this.lockFilePath)) {
        fs.unlinkSync(this.lockFilePath);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Failed to force unlock: ${error.message}`);
    }
  }
}

// Singleton instance for convenience
const defaultStateLock = new StateLock();

module.exports = {
  StateLock,
  // Convenience functions using default instance
  readState: () => defaultStateLock.readState(),
  writeState: (state) => defaultStateLock.writeState(state),
  transaction: (fn) => defaultStateLock.transaction(fn),
  updateTask: (taskId, updates) => defaultStateLock.updateTask(taskId, updates),
  clearTaskAssignment: (taskId, assignee) => defaultStateLock.clearTaskAssignment(taskId, assignee),
  assignTask: (taskId, agentId) => defaultStateLock.assignTask(taskId, agentId),
  getLockStatus: () => defaultStateLock.getLockStatus(),
  forceUnlock: () => defaultStateLock.forceUnlock()
};