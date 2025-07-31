#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { transaction, updateTask, clearTaskAssignment } = require('./utils/StateLock');
const { getLogger } = require('./utils/AutomationLogger');
const { getConfigManager } = require('./utils/ConfigManager');

// Get task ID from command line argument
const taskId = process.argv[2];
const newState = process.argv[3] || 'REVIEW'; // Default to REVIEW

if (!taskId) {
  console.error('Usage: node finish-task.js <task-id> [new-state]');
  console.error('Example: node finish-task.js T-1752951043927-918 REVIEW');
  console.error('States: REVIEW, COMPLETED, APPROVED, DONE, BLOCKED');
  process.exit(1);
}

// Initialize configuration and logger
const configManager = getConfigManager();
const automationConfig = configManager.loadConfig('automation');
const logger = getLogger('finish-task', {
  logLevel: automationConfig.logLevel,
  enableLogging: automationConfig.enableLogging,
});

const validStates = ['REVIEW', 'COMPLETED', 'APPROVED', 'DONE', 'BLOCKED'];
if (!validStates.includes(newState)) {
  logger.error(`Invalid state: ${newState}. Must be one of: ${validStates.join(', ')}`);
  process.exit(1);
}

// Use atomic transaction for thread-safe state updates
async function finishTask() {
  logger.start(`Updating task ${taskId} to ${newState}`, { taskId, newState });

  try {
    const result = await transaction(state => {
      // Check if task exists
      if (!state.tasks[taskId]) {
        throw new Error(`Task ${taskId} not found`);
      }

      const task = state.tasks[taskId];
      const oldState = task.state;

      logger.taskStart(taskId, 'Processing state transition');

      // Update task state
      task.state = newState;
      task.updated = new Date().toISOString();

      // If moving to terminal states, clear assignments
      if ((newState === 'COMPLETED' || newState === 'APPROVED' || newState === 'DONE') && task.assignee) {
        const assignments = state.assignments && state.assignments[task.assignee];
        if (assignments) {
          // Handle both array and comma-separated string formats
          const taskList = Array.isArray(assignments)
            ? assignments.filter(id => id !== taskId)
            : assignments.split(',').filter(id => id !== taskId);

          if (taskList.length === 0) {
            delete state.assignments[task.assignee];
          } else {
            state.assignments[task.assignee] = taskList;
          }

          logger.assignmentClear(taskId, task.assignee);
        }
      }

      return { task, oldState };
    });

    logger.taskComplete(
      taskId,
      {
        oldState: result.oldState,
        newState,
        title: result.task.title,
      },
      'Task state updated successfully'
    );

    console.log(`\n✓ Task ${taskId} updated successfully`);
    console.log(`  Title: ${result.task.title}`);
    console.log(`  State: ${result.oldState} → ${newState}`);
    console.log(`  Assignee: ${result.task.assignee}`);

    // Show next steps
    if (newState === 'REVIEW') {
      console.log('\n→ Task is now in review. A QA agent or reviewer should verify the work.');
    } else if (newState === 'COMPLETED') {
      console.log('\n→ Task is completed! Great work.');
    } else if (newState === 'APPROVED') {
      console.log('\n→ Task is approved and ready for deployment! Excellent work.');
    } else if (newState === 'DONE') {
      console.log('\n→ Task is completely finished and deployed! 🎉');
    } else if (newState === 'BLOCKED') {
      console.log('\n→ Task is blocked. Please add notes about the blocker.');
    }

    logger.finish('Task update completed successfully');
  } catch (error) {
    logger.handleError(error, { taskId, newState });
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the async function
finishTask();
