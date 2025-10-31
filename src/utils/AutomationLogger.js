/**
 * Unified Automation Logger
 * Provides consistent logging, error handling, and structured output across all automation scripts
 */

const fs = require('fs');
const path = require('path');

class AutomationLogger {
  constructor(scriptName, options = {}) {
    this.scriptName = scriptName || this.extractScriptName();
    this.logLevel = options.logLevel || 'INFO';
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile || false;
    this.logFile =
      options.logFile || path.join(__dirname, '..', 'logs', 'automation.log');
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.context = options.context || {};

    // Create logs directory if it doesn't exist
    if (this.enableFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }

    // Log levels
    this.levels = {
      TRACE: 0,
      DEBUG: 1,
      INFO: 2,
      WARN: 3,
      ERROR: 4,
      FATAL: 5
    };

    // Emojis for different log levels
    this.emojis = {
      TRACE: '🔍',
      DEBUG: '🐛',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      FATAL: '💥',
      SUCCESS: '✅',
      PROGRESS: '🔄',
      START: '🚀',
      FINISH: '🏁'
    };

    this.startTime = Date.now();
  }

  extractScriptName() {
    // Get the script name from the call stack
    const stack = new Error().stack;
    const callerLine = stack.split('\n')[3]; // Skip Error, constructor, extractScriptName
    const match = callerLine.match(/\/([^\/]+)\.js:/);
    return match ? match[1] : 'unknown-script';
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const emoji = this.emojis[level] || '';

    const logEntry = {
      timestamp,
      level,
      script: this.scriptName,
      message,
      ...(data && { data }),
      ...(Object.keys(this.context).length > 0 && { context: this.context })
    };

    // Console format (human readable)
    let consoleMsg = `${emoji} [${timestamp}] ${this.scriptName}:${level} - ${message}`;
    if (data) {
      consoleMsg += `\n   Data: ${JSON.stringify(data, null, 2)}`;
    }

    return { logEntry, consoleMsg };
  }

  writeToFile(logEntry) {
    if (!this.enableFile) {return;}

    try {
      // Check file size and rotate if necessary
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        if (stats.size > this.maxFileSize) {
          this.rotateLogFile();
        }
      }

      // Append to log file
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  rotateLogFile() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = this.logFile.replace('.log', `-${timestamp}.log`);
      fs.renameSync(this.logFile, rotatedFile);
    } catch (error) {
      console.error('Failed to rotate log file:', error.message);
    }
  }

  log(level, message, data = null) {
    if (!this.shouldLog(level)) {return;}

    const { logEntry, consoleMsg } = this.formatMessage(level, message, data);

    if (this.enableConsole) {
      console.log(consoleMsg);
    }

    this.writeToFile(logEntry);
  }

  // Convenience methods
  trace(message, data = null) {
    this.log('TRACE', message, data);
  }
  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }
  info(message, data = null) {
    this.log('INFO', message, data);
  }
  warn(message, data = null) {
    this.log('WARN', message, data);
  }
  error(message, data = null) {
    this.log('ERROR', message, data);
  }
  fatal(message, data = null) {
    this.log('FATAL', message, data);
  }

  // Special methods for automation workflows
  success(message, data = null) {
    const { logEntry, consoleMsg } = this.formatMessage(
      'SUCCESS',
      message,
      data
    );
    if (this.enableConsole) {
      console.log(consoleMsg.replace('SUCCESS', 'INFO')); // Use INFO level for file logging
    }
    logEntry.level = 'INFO'; // Store as INFO in file
    this.writeToFile(logEntry);
  }

  progress(message, data = null) {
    const { logEntry, consoleMsg } = this.formatMessage(
      'PROGRESS',
      message,
      data
    );
    if (this.enableConsole) {
      console.log(consoleMsg.replace('PROGRESS', 'INFO'));
    }
    logEntry.level = 'INFO';
    this.writeToFile(logEntry);
  }

  start(message = 'Starting automation script', data = null) {
    this.startTime = Date.now();
    const { logEntry, consoleMsg } = this.formatMessage('START', message, data);
    if (this.enableConsole) {
      console.log(consoleMsg.replace('START', 'INFO'));
    }
    logEntry.level = 'INFO';
    this.writeToFile(logEntry);
  }

  finish(message = 'Automation script completed', data = null) {
    const duration = Date.now() - this.startTime;
    const finalData = { ...data, durationMs: duration };
    const finalMessage = `${message} (${duration}ms)`;

    const { logEntry, consoleMsg } = this.formatMessage(
      'FINISH',
      finalMessage,
      finalData
    );
    if (this.enableConsole) {
      console.log(consoleMsg.replace('FINISH', 'INFO'));
    }
    logEntry.level = 'INFO';
    this.writeToFile(logEntry);
  }

  // Task-specific logging methods
  taskStart(taskId, message = 'Starting task processing') {
    this.progress(`${message}: ${taskId}`, { taskId, action: 'start' });
  }

  taskComplete(taskId, result, message = 'Task completed') {
    this.success(`${message}: ${taskId}`, {
      taskId,
      result,
      action: 'complete'
    });
  }

  taskError(taskId, error, message = 'Task failed') {
    this.error(`${message}: ${taskId}`, {
      taskId,
      error: error.message || error,
      stack: error.stack,
      action: 'error'
    });
  }

  // QA-specific logging methods
  qaStart(taskCount, message = 'Starting QA processing') {
    this.start(`${message} for ${taskCount} tasks`, {
      taskCount,
      phase: 'qa_start'
    });
  }

  qaApprove(taskId, score, reason) {
    this.success(`QA APPROVED: ${taskId} (Score: ${score}/5.0)`, {
      taskId,
      score,
      reason,
      action: 'qa_approve'
    });
  }

  qaReject(taskId, score, issues) {
    this.warn(`QA REJECTED: ${taskId} (Score: ${score}/5.0)`, {
      taskId,
      score,
      issues,
      action: 'qa_reject'
    });
  }

  qaFinish(stats, message = 'QA processing completed') {
    this.finish(message, { ...stats, phase: 'qa_complete' });
  }

  // Assignment-specific logging
  assignmentClear(taskId, agentId) {
    this.info(`Cleared assignment: ${taskId} from ${agentId}`, {
      taskId,
      agentId,
      action: 'assignment_clear'
    });
  }

  assignmentAdd(taskId, agentId) {
    this.info(`Assigned task: ${taskId} to ${agentId}`, {
      taskId,
      agentId,
      action: 'assignment_add'
    });
  }

  // State management logging
  stateRead(message = 'Reading state file') {
    this.debug(message, { action: 'state_read' });
  }

  stateWrite(message = 'Writing state file') {
    this.debug(message, { action: 'state_write' });
  }

  stateLock(message = 'Acquired state lock') {
    this.debug(message, { action: 'state_lock' });
  }

  stateUnlock(message = 'Released state lock') {
    this.debug(message, { action: 'state_unlock' });
  }

  // Error handling and recovery
  handleError(error, context = {}) {
    const errorData = {
      error: error.message || error,
      stack: error.stack,
      code: error.code,
      ...context
    };

    this.error('Automation error occurred', errorData);

    // Return structured error for consistent error handling
    return {
      success: false,
      error: error.message || error,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      context
    };
  }

  // Performance monitoring
  measureTime(label, fn) {
    const start = Date.now();
    this.debug(`Starting performance measurement: ${label}`);

    const result = fn();

    const duration = Date.now() - start;
    this.info(`Performance: ${label} completed in ${duration}ms`, {
      label,
      duration,
      action: 'performance_measurement'
    });

    return result;
  }

  async measureTimeAsync(label, fn) {
    const start = Date.now();
    this.debug(`Starting async performance measurement: ${label}`);

    const result = await fn();

    const duration = Date.now() - start;
    this.info(`Performance: ${label} completed in ${duration}ms`, {
      label,
      duration,
      action: 'performance_measurement'
    });

    return result;
  }

  // Update context for current operation
  setContext(newContext) {
    this.context = { ...this.context, ...newContext };
  }

  clearContext() {
    this.context = {};
  }

  // Get log statistics
  getStats() {
    return {
      scriptName: this.scriptName,
      logLevel: this.logLevel,
      startTime: new Date(this.startTime).toISOString(),
      uptime: Date.now() - this.startTime,
      logFile: this.enableFile ? this.logFile : null
    };
  }
}

// Singleton logger for convenience
let defaultLogger = null;

function getLogger(scriptName = null, options = {}) {
  if (!defaultLogger || scriptName) {
    defaultLogger = new AutomationLogger(scriptName, options);
  }
  return defaultLogger;
}

module.exports = {
  AutomationLogger,
  getLogger,
  // Convenience exports for quick access
  logger: getLogger()
};
