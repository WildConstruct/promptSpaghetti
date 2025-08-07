#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getTypeScriptErrors() {
  log('\n📊 Running TypeScript compiler to collect errors...', 'cyan');
  
  try {
    execSync('pnpm tsc --noEmit', { stdio: 'pipe' });
    log('✅ No TypeScript errors found!', 'green');
    return [];
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.toString();
    const lines = output.split('\n');
    const errors = [];
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5],
          fullLine: line
        });
      }
    }
    
    return errors;
  }
}

function groupErrorsByFile(errors) {
  const grouped = {};
  
  for (const error of errors) {
    if (!grouped[error.file]) {
      grouped[error.file] = [];
    }
    grouped[error.file].push(error);
  }
  
  // Sort files by number of errors (most errors first)
  const sorted = Object.entries(grouped)
    .sort(([, a], [, b]) => b.length - a.length)
    .reduce((acc, [file, errors]) => {
      acc[file] = errors;
      return acc;
    }, {});
  
  return sorted;
}

function groupErrorsByType(errors) {
  const errorTypes = {
    'TS1003': { name: 'Identifier expected', count: 0, files: new Set() },
    'TS1005': { name: 'Punctuation expected', count: 0, files: new Set() },
    'TS1109': { name: 'Expression expected', count: 0, files: new Set() },
    'TS1128': { name: 'Declaration or statement expected', count: 0, files: new Set() },
    'TS1131': { name: 'Property or signature expected', count: 0, files: new Set() },
    'TS1135': { name: 'Argument expression expected', count: 0, files: new Set() },
    'TS1136': { name: 'Property assignment expected', count: 0, files: new Set() },
    'other': { name: 'Other errors', count: 0, files: new Set() }
  };
  
  for (const error of errors) {
    const type = errorTypes[error.code] ? error.code : 'other';
    errorTypes[type].count++;
    errorTypes[type].files.add(error.file);
  }
  
  return errorTypes;
}

function findCommonPatterns(errors) {
  const patterns = {
    missingClosingBrace: 0,
    missingComma: 0,
    missingSemicolon: 0,
    missingParenthesis: 0,
    unexpectedToken: 0
  };
  
  for (const error of errors) {
    if (error.message.includes('}') || error.message.includes('expected')) {
      patterns.missingClosingBrace++;
    }
    if (error.message.includes(',')) {
      patterns.missingComma++;
    }
    if (error.message.includes(';')) {
      patterns.missingSemicolon++;
    }
    if (error.message.includes(')') || error.message.includes('(')) {
      patterns.missingParenthesis++;
    }
  }
  
  return patterns;
}

function generateFixingStrategy(errors, errorsByFile, errorTypes) {
  log('\n🎯 Generating fixing strategy...', 'magenta');
  
  const strategy = [];
  
  // Priority 1: Fix test files first (they often have simpler syntax errors)
  const testFiles = Object.keys(errorsByFile).filter(f => 
    f.includes('__tests__') || f.includes('.test.') || f.includes('.spec.')
  );
  
  if (testFiles.length > 0) {
    strategy.push({
      phase: 'Test Files',
      files: testFiles,
      reason: 'Test files often have simpler syntax errors and fixing them first can reveal patterns'
    });
  }
  
  // Priority 2: Fix files with the most errors
  const heavyErrorFiles = Object.entries(errorsByFile)
    .filter(([file]) => !testFiles.includes(file))
    .filter(([, errors]) => errors.length > 10)
    .map(([file]) => file);
  
  if (heavyErrorFiles.length > 0) {
    strategy.push({
      phase: 'High Error Count Files',
      files: heavyErrorFiles.slice(0, 5),
      reason: 'These files have many errors and fixing them will significantly reduce total error count'
    });
  }
  
  // Priority 3: Fix by error type
  const punctuationErrors = Object.entries(errorsByFile)
    .filter(([, fileErrors]) => 
      fileErrors.some(e => ['TS1005', 'TS1003'].includes(e.code))
    )
    .map(([file]) => file);
  
  if (punctuationErrors.length > 0) {
    strategy.push({
      phase: 'Punctuation Errors',
      files: punctuationErrors.slice(0, 10),
      reason: 'Missing punctuation often cascades into other errors'
    });
  }
  
  return strategy;
}

function createTmuxDebugSession(strategy) {
  log('\n🖥️  Creating tmux debug session...', 'blue');
  
  const sessionName = 'ts-debug';
  
  // Check if session exists
  try {
    execSync(`tmux has-session -t ${sessionName} 2>/dev/null`);
    log(`Session ${sessionName} already exists. Killing it...`, 'yellow');
    execSync(`tmux kill-session -t ${sessionName}`);
  } catch (e) {
    // Session doesn't exist, which is fine
  }
  
  // Create new session
  execSync(`tmux new-session -d -s ${sessionName}`);
  
  // Create panes
  execSync(`tmux split-window -h -t ${sessionName}`);
  execSync(`tmux split-window -v -t ${sessionName}:0.1`);
  
  // Set up pane 0: Main editor
  execSync(`tmux send-keys -t ${sessionName}:0.0 'echo "Main Editor Pane"' Enter`);
  
  // Set up pane 1: TypeScript compiler watch
  execSync(`tmux send-keys -t ${sessionName}:0.1 'echo "TypeScript Compiler Watch"' Enter`);
  execSync(`tmux send-keys -t ${sessionName}:0.1 'pnpm tsc --noEmit --watch' Enter`);
  
  // Set up pane 2: Debug info
  execSync(`tmux send-keys -t ${sessionName}:0.2 'echo "Debug Info & Strategy"' Enter`);
  
  // Write strategy to file
  const strategyFile = path.join(__dirname, 'debug-strategy.md');
  let strategyContent = '# TypeScript Error Fixing Strategy\n\n';
  
  strategy.forEach((phase, index) => {
    strategyContent += `## Phase ${index + 1}: ${phase.phase}\n\n`;
    strategyContent += `**Reason:** ${phase.reason}\n\n`;
    strategyContent += '**Files to fix:**\n';
    phase.files.forEach(file => {
      strategyContent += `- ${file}\n`;
    });
    strategyContent += '\n';
  });
  
  fs.writeFileSync(strategyFile, strategyContent);
  
  // Display strategy in pane 2
  execSync(`tmux send-keys -t ${sessionName}:0.2 'cat ${strategyFile}' Enter`);
  
  log(`\n✅ Tmux session '${sessionName}' created with 3 panes:`, 'green');
  log('  - Pane 0: Main editor', 'cyan');
  log('  - Pane 1: TypeScript compiler watch', 'cyan');
  log('  - Pane 2: Debug strategy', 'cyan');
  log(`\nAttach to session: tmux attach -t ${sessionName}`, 'yellow');
}

function main() {
  log('🔍 TypeScript Error Debugging Tool', 'magenta');
  log('=' .repeat(40), 'magenta');
  
  // Get all TypeScript errors
  const errors = getTypeScriptErrors();
  
  if (errors.length === 0) {
    return;
  }
  
  log(`\n❌ Found ${errors.length} TypeScript errors`, 'red');
  
  // Group errors
  const errorsByFile = groupErrorsByFile(errors);
  const errorTypes = groupErrorsByType(errors);
  const patterns = findCommonPatterns(errors);
  
  // Display summary
  log('\n📊 Error Summary:', 'yellow');
  log(`Total files with errors: ${Object.keys(errorsByFile).length}`, 'cyan');
  
  log('\n🔍 Error Types:', 'yellow');
  Object.entries(errorTypes).forEach(([code, data]) => {
    if (data.count > 0) {
      log(`  ${code}: ${data.name} (${data.count} errors in ${data.files.size} files)`, 'cyan');
    }
  });
  
  log('\n📝 Common Patterns:', 'yellow');
  Object.entries(patterns).forEach(([pattern, count]) => {
    if (count > 0) {
      log(`  ${pattern}: ${count} occurrences`, 'cyan');
    }
  });
  
  // Show top 5 files with most errors
  log('\n🎯 Top 5 files with most errors:', 'yellow');
  Object.entries(errorsByFile)
    .slice(0, 5)
    .forEach(([file, fileErrors]) => {
      log(`  ${path.basename(file)}: ${fileErrors.length} errors`, 'cyan');
    });
  
  // Generate fixing strategy
  const strategy = generateFixingStrategy(errors, errorsByFile, errorTypes);
  
  // Create tmux session
  if (process.argv.includes('--tmux')) {
    createTmuxDebugSession(strategy);
  } else {
    log('\n💡 Run with --tmux flag to create a debugging tmux session', 'yellow');
  }
  
  // Save detailed error report
  const reportFile = path.join(__dirname, 'typescript-errors-report.json');
  fs.writeFileSync(reportFile, JSON.stringify({
    summary: {
      totalErrors: errors.length,
      filesWithErrors: Object.keys(errorsByFile).length,
      errorTypes,
      patterns
    },
    errorsByFile,
    strategy
  }, null, 2));
  
  log(`\n📄 Detailed report saved to: ${reportFile}`, 'green');
}

// Run the script
main();