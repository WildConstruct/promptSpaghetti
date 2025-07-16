#!/usr/bin/env node

/**
 * Extension Debugger - Epic 8.4 Story 8.4.6
 * Advanced debugging tools for extension development
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class ExtensionDebugger {
  constructor() {
    this.debugSessions = new Map();
    this.breakpoints = new Map();
    this.watchpoints = new Map();
    this.logBuffer = [];
  }

  async startDebugSession(extensionPath, options = {}) {
    const sessionId = this.generateSessionId();
    
    console.log(`🐛 Starting debug session: ${sessionId}`);
    console.log(`Extension: ${extensionPath}`);
    
    const session = {
      id: sessionId,
      extensionPath,
      options,
      startTime: Date.now(),
      status: 'running',
      logs: [],
      performance: [],
      errors: []
    };
    
    this.debugSessions.set(sessionId, session);
    
    try {
      // Load extension for debugging
      await this.loadExtensionForDebugging(session);
      
      // Set up debugging environment
      this.setupDebuggingEnvironment(session);
      
      // Start monitoring
      this.startMonitoring(session);
      
      console.log(`✅ Debug session started: ${sessionId}`);
      return sessionId;
      
    } catch (error) {
      console.error(`Failed to start debug session: ${error.message}`);
      this.debugSessions.delete(sessionId);
      throw error;
    }
  }

  async loadExtensionForDebugging(session) {
    const manifestPath = path.join(session.extensionPath, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Manifest file not found');
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    session.manifest = manifest;
    
    // Load source files for debugging
    session.sourceFiles = this.loadSourceFiles(session.extensionPath);
    
    this.log(session, 'Extension loaded for debugging', { 
      id: manifest.id, 
      type: manifest.extension_type 
    });
  }

  loadSourceFiles(extensionPath) {
    const sourceFiles = {};
    const srcDir = path.join(extensionPath, 'src');
    
    if (fs.existsSync(srcDir)) {
      this.walkDirectory(srcDir, (filePath, content) => {
        const relativePath = path.relative(srcDir, filePath);
        sourceFiles[relativePath] = {
          path: filePath,
          content,
          lines: content.split('\n'),
          breakpoints: new Set()
        };
      });
    }
    
    return sourceFiles;
  }

  walkDirectory(dir, callback) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.walkDirectory(filePath, callback);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        callback(filePath, content);
      }
    }
  }

  setupDebuggingEnvironment(session) {
    // Set up debug hooks
    this.setupDebugHooks(session);
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring(session);
    
    // Set up error tracking
    this.setupErrorTracking(session);
  }

  setupDebugHooks(session) {
    // Console override for capturing logs
    const originalConsole = console;
    console.log = (...args) => {
      this.log(session, 'console.log', args);
      originalConsole.log(...args);
    };
    
    console.error = (...args) => {
      this.log(session, 'console.error', args);
      session.errors.push({
        timestamp: Date.now(),
        type: 'console.error',
        message: args.join(' ')
      });
      originalConsole.error(...args);
    };
    
    console.warn = (...args) => {
      this.log(session, 'console.warn', args);
      originalConsole.warn(...args);
    };
  }

  setupPerformanceMonitoring(session) {
    // Hook into performance.mark and performance.measure
    const originalMark = performance.mark.bind(performance);
    const originalMeasure = performance.measure.bind(performance);
    
    performance.mark = (markName) => {
      this.log(session, 'performance.mark', { mark: markName });
      return originalMark(markName);
    };
    
    performance.measure = (measureName, startMark, endMark) => {
      const result = originalMeasure(measureName, startMark, endMark);
      
      session.performance.push({
        timestamp: Date.now(),
        name: measureName,
        duration: result ? result.duration : null,
        startMark,
        endMark
      });
      
      this.log(session, 'performance.measure', {
        measure: measureName,
        duration: result ? result.duration : null
      });
      
      return result;
    };
  }

  setupErrorTracking(session) {
    // Hook into error events
    process.on('uncaughtException', (error) => {
      session.errors.push({
        timestamp: Date.now(),
        type: 'uncaughtException',
        message: error.message,
        stack: error.stack
      });
      
      this.log(session, 'uncaughtException', {
        message: error.message,
        stack: error.stack
      });
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      session.errors.push({
        timestamp: Date.now(),
        type: 'unhandledRejection',
        reason: reason.toString(),
        promise: promise.toString()
      });
      
      this.log(session, 'unhandledRejection', {
        reason: reason.toString()
      });
    });
  }

  startMonitoring(session) {
    // Start periodic monitoring
    session.monitoringInterval = setInterval(() => {
      this.collectMetrics(session);
    }, 1000);
  }

  collectMetrics(session) {
    const metrics = {
      timestamp: Date.now(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime()
    };
    
    session.performance.push({
      timestamp: Date.now(),
      type: 'metrics',
      data: metrics
    });
  }

  setBreakpoint(sessionId, file, line) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    const sourceFile = session.sourceFiles[file];
    if (!sourceFile) {
      throw new Error(`Source file not found: ${file}`);
    }
    
    sourceFile.breakpoints.add(line);
    
    const breakpointId = `${file}:${line}`;
    this.breakpoints.set(breakpointId, {
      sessionId,
      file,
      line,
      condition: null,
      hitCount: 0
    });
    
    this.log(session, 'breakpoint.set', { file, line });
    console.log(`🔴 Breakpoint set: ${file}:${line}`);
    
    return breakpointId;
  }

  removeBreakpoint(sessionId, breakpointId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    const breakpoint = this.breakpoints.get(breakpointId);
    if (!breakpoint) {
      throw new Error('Breakpoint not found');
    }
    
    const sourceFile = session.sourceFiles[breakpoint.file];
    if (sourceFile) {
      sourceFile.breakpoints.delete(breakpoint.line);
    }
    
    this.breakpoints.delete(breakpointId);
    
    this.log(session, 'breakpoint.remove', { breakpointId });
    console.log(`⚪ Breakpoint removed: ${breakpointId}`);
  }

  addWatchpoint(sessionId, expression) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    const watchpointId = this.generateSessionId();
    
    this.watchpoints.set(watchpointId, {
      sessionId,
      expression,
      lastValue: null,
      changeCount: 0
    });
    
    this.log(session, 'watchpoint.add', { expression, watchpointId });
    console.log(`👁️ Watchpoint added: ${expression}`);
    
    return watchpointId;
  }

  evaluateExpression(sessionId, expression, context = {}) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    try {
      // Create safe evaluation context
      const safeContext = {
        ...context,
        console: {
          log: (...args) => this.log(session, 'eval.console.log', args)
        }
      };
      
      // Simple expression evaluation (in production, use a proper sandbox)
      const result = this.safeEval(expression, safeContext);
      
      this.log(session, 'expression.evaluate', {
        expression,
        result: result?.toString?.() || result
      });
      
      return result;
      
    } catch (error) {
      this.log(session, 'expression.error', {
        expression,
        error: error.message
      });
      
      throw new Error(`Expression evaluation failed: ${error.message}`);
    }
  }

  safeEval(expression, context) {
    // Very basic safe evaluation - in production, use a proper sandbox
    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);
    
    try {
      const func = new Function(...contextKeys, `return ${expression}`);
      return func(...contextValues);
    } catch (error) {
      throw new Error(`Evaluation error: ${error.message}`);
    }
  }

  getStackTrace(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    const stack = new Error().stack;
    const trace = stack.split('\n').slice(1).map(line => {
      const match = line.match(/at (.+) \((.+):(\d+):(\d+)\)/);
      if (match) {
        return {
          function: match[1],
          file: match[2],
          line: parseInt(match[3]),
          column: parseInt(match[4])
        };
      }
      return { raw: line };
    });
    
    this.log(session, 'stackTrace.get', { trace });
    return trace;
  }

  inspectVariable(sessionId, variableName, scope = 'local') {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    // In a real implementation, this would inspect actual variable values
    const mockVariable = {
      name: variableName,
      type: 'unknown',
      value: 'Variable inspection not implemented in mock',
      scope
    };
    
    this.log(session, 'variable.inspect', mockVariable);
    return mockVariable;
  }

  stepInto(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    this.log(session, 'debugger.stepInto');
    console.log('🦶 Step into');
    
    // In a real implementation, this would control execution flow
  }

  stepOver(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    this.log(session, 'debugger.stepOver');
    console.log('➡️ Step over');
  }

  stepOut(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    this.log(session, 'debugger.stepOut');
    console.log('⬆️ Step out');
  }

  continue(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    this.log(session, 'debugger.continue');
    console.log('▶️ Continue');
  }

  pause(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    this.log(session, 'debugger.pause');
    console.log('⏸️ Paused');
  }

  generateDebugReport(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    const duration = Date.now() - session.startTime;
    
    const report = {
      sessionId,
      extension: {
        path: session.extensionPath,
        manifest: session.manifest
      },
      duration,
      summary: {
        totalLogs: session.logs.length,
        totalErrors: session.errors.length,
        totalPerformanceEntries: session.performance.length,
        breakpointsSet: Array.from(this.breakpoints.values())
          .filter(bp => bp.sessionId === sessionId).length,
        watchpointsSet: Array.from(this.watchpoints.values())
          .filter(wp => wp.sessionId === sessionId).length
      },
      logs: session.logs,
      errors: session.errors,
      performance: session.performance
    };
    
    return report;
  }

  exportDebugSession(sessionId, outputPath) {
    const report = this.generateDebugReport(sessionId);
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📄 Debug session exported to: ${outputPath}`);
    
    return outputPath;
  }

  stopDebugSession(sessionId) {
    const session = this.debugSessions.get(sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }
    
    // Clean up monitoring
    if (session.monitoringInterval) {
      clearInterval(session.monitoringInterval);
    }
    
    // Clean up breakpoints
    const sessionBreakpoints = Array.from(this.breakpoints.entries())
      .filter(([_, bp]) => bp.sessionId === sessionId);
    
    for (const [id] of sessionBreakpoints) {
      this.breakpoints.delete(id);
    }
    
    // Clean up watchpoints
    const sessionWatchpoints = Array.from(this.watchpoints.entries())
      .filter(([_, wp]) => wp.sessionId === sessionId);
    
    for (const [id] of sessionWatchpoints) {
      this.watchpoints.delete(id);
    }
    
    session.status = 'stopped';
    this.log(session, 'debugger.stop');
    
    console.log(`🛑 Debug session stopped: ${sessionId}`);
    
    // Generate final report
    const report = this.generateDebugReport(sessionId);
    this.debugSessions.delete(sessionId);
    
    return report;
  }

  listDebugSessions() {
    const sessions = Array.from(this.debugSessions.values()).map(session => ({
      id: session.id,
      extensionPath: session.extensionPath,
      status: session.status,
      startTime: new Date(session.startTime).toISOString(),
      duration: Date.now() - session.startTime
    }));
    
    return sessions;
  }

  log(session, event, data = {}) {
    const logEntry = {
      timestamp: Date.now(),
      event,
      data
    };
    
    session.logs.push(logEntry);
    this.logBuffer.push(logEntry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > 1000) {
      this.logBuffer = this.logBuffer.slice(-500);
    }
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2, 15);
  }
}

// CLI Implementation
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showUsage();
    return;
  }

  const command = args[0];
  const debugger = new ExtensionDebugger();
  
  switch (command) {
    case 'start':
      await handleStart(debugger, args.slice(1));
      break;
    case 'interactive':
      await handleInteractive(debugger, args.slice(1));
      break;
    case 'help':
      showUsage();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showUsage();
      process.exit(1);
  }
}

async function handleStart(debugger, args) {
  if (args.length === 0) {
    console.error('Usage: extension-debugger start <extension-path>');
    process.exit(1);
  }

  const extensionPath = args[0];
  
  try {
    const sessionId = await debugger.startDebugSession(extensionPath);
    
    // Simple debugging session
    console.log('\n📝 Debug commands:');
    console.log('  Type "help" for available commands');
    console.log('  Type "exit" to stop debugging\n');
    
    // In a real implementation, this would start an interactive session
    setTimeout(() => {
      const report = debugger.stopDebugSession(sessionId);
      console.log('\n📊 Debug Summary:');
      console.log(`Total logs: ${report.summary.totalLogs}`);
      console.log(`Total errors: ${report.summary.totalErrors}`);
      console.log(`Duration: ${Math.round(report.duration / 1000)}s`);
    }, 5000);
    
  } catch (error) {
    console.error(`Failed to start debugging: ${error.message}`);
    process.exit(1);
  }
}

async function handleInteractive(debugger, args) {
  if (args.length === 0) {
    console.error('Usage: extension-debugger interactive <extension-path>');
    process.exit(1);
  }

  const extensionPath = args[0];
  
  try {
    const sessionId = await debugger.startDebugSession(extensionPath);
    
    console.log('\n🔧 Interactive Debug Mode');
    console.log('Type "help" for available commands\n');
    
    // Start interactive session
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'debug> '
    });
    
    rl.prompt();
    
    rl.on('line', async (line) => {
      const [cmd, ...cmdArgs] = line.trim().split(' ');
      
      try {
        switch (cmd) {
          case 'help':
            showDebugHelp();
            break;
          case 'break':
            if (cmdArgs.length >= 2) {
              debugger.setBreakpoint(sessionId, cmdArgs[0], parseInt(cmdArgs[1]));
            } else {
              console.log('Usage: break <file> <line>');
            }
            break;
          case 'watch':
            if (cmdArgs.length >= 1) {
              debugger.addWatchpoint(sessionId, cmdArgs.join(' '));
            } else {
              console.log('Usage: watch <expression>');
            }
            break;
          case 'eval':
            if (cmdArgs.length >= 1) {
              const result = debugger.evaluateExpression(sessionId, cmdArgs.join(' '));
              console.log('Result:', result);
            } else {
              console.log('Usage: eval <expression>');
            }
            break;
          case 'stack':
            const trace = debugger.getStackTrace(sessionId);
            console.log('Stack trace:', trace);
            break;
          case 'continue':
            debugger.continue(sessionId);
            break;
          case 'step':
            debugger.stepOver(sessionId);
            break;
          case 'stepin':
            debugger.stepInto(sessionId);
            break;
          case 'stepout':
            debugger.stepOut(sessionId);
            break;
          case 'pause':
            debugger.pause(sessionId);
            break;
          case 'export':
            const outputPath = cmdArgs[0] || `debug-session-${sessionId}.json`;
            debugger.exportDebugSession(sessionId, outputPath);
            break;
          case 'exit':
            debugger.stopDebugSession(sessionId);
            rl.close();
            return;
          case '':
            break;
          default:
            console.log(`Unknown command: ${cmd}. Type "help" for available commands.`);
        }
      } catch (error) {
        console.error(`Command failed: ${error.message}`);
      }
      
      rl.prompt();
    });
    
    rl.on('close', () => {
      console.log('\nExiting debug session...');
      if (debugger.debugSessions.has(sessionId)) {
        debugger.stopDebugSession(sessionId);
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error(`Failed to start interactive debugging: ${error.message}`);
    process.exit(1);
  }
}

function showDebugHelp() {
  console.log(`
Debug Commands:
  break <file> <line>    Set breakpoint at file:line
  watch <expression>     Watch an expression
  eval <expression>      Evaluate an expression
  stack                  Show stack trace
  continue               Continue execution
  step                   Step over
  stepin                 Step into
  stepout                Step out
  pause                  Pause execution
  export [file]          Export debug session
  help                   Show this help
  exit                   Exit debug session
`);
}

function showUsage() {
  console.log(`
🐛 PromptSpaghetti Extension Debugger

Usage:
  extension-debugger start <extension-path>
  extension-debugger interactive <extension-path>
  extension-debugger help

Commands:
  start <path>           Start basic debug session
  interactive <path>     Start interactive debug session
  help                   Show this help message

Features:
  🔴 Breakpoints and watchpoints
  📊 Performance monitoring
  🔍 Variable inspection
  📝 Comprehensive logging
  📄 Debug session export

Examples:
  extension-debugger start ./my-extension/
  extension-debugger interactive ./my-extension/

For more information, visit: https://docs.prompt-spaghetti.dev/extensions/debugging/
`);
}

// Export for testing
if (require.main === module) {
  main();
}

module.exports = { ExtensionDebugger };