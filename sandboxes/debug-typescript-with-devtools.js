#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 TypeScript Debugger with Chrome DevTools');
console.log('==========================================\n');

// Create a debugging script that analyzes TypeScript errors
const debugScript = `
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Set a breakpoint here to start debugging
debugger;

console.log('🎯 Starting TypeScript error analysis...');

// Get TypeScript errors
function getTypeScriptErrors() {
  try {
    execSync('pnpm tsc --noEmit 2>&1', { encoding: 'utf8' });
    return [];
  } catch (error) {
    const output = error.stdout || '';
    const lines = output.split('\\n');
    const errors = [];
    
    lines.forEach(line => {
      const match = line.match(/^(.+?)\\((\\d+),(\\d+)\\): error (TS\\d+): (.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          message: match[5]
        });
      }
    });
    
    return errors;
  }
}

// Group errors by type
function groupErrorsByType(errors) {
  const grouped = {};
  errors.forEach(error => {
    if (!grouped[error.code]) {
      grouped[error.code] = {
        count: 0,
        message: error.message,
        examples: []
      };
    }
    grouped[error.code].count++;
    if (grouped[error.code].examples.length < 5) {
      grouped[error.code].examples.push({
        file: error.file,
        line: error.line,
        column: error.column
      });
    }
  });
  return grouped;
}

// Analyze a specific file
function analyzeFile(filePath) {
  console.log(\`\\n📄 Analyzing \${filePath}...\`);
  
  if (!fs.existsSync(filePath)) {
    console.log('File not found!');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\\n');
  
  // Check for common syntax issues
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;
  
  lines.forEach((line, index) => {
    // Count braces
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
    }
    
    // Check for common patterns
    if (line.includes('interface') && line.includes('{') && index < lines.length - 1) {
      const nextLine = lines[index + 1];
      if (nextLine.trim().startsWith('interface')) {
        console.log(\`Line \${index + 1}: Missing closing brace for interface\`);
      }
    }
  });
  
  console.log(\`Brace balance: \${braceCount}\`);
  console.log(\`Parenthesis balance: \${parenCount}\`);
  console.log(\`Bracket balance: \${bracketCount}\`);
  
  return { braceCount, parenCount, bracketCount };
}

// Main debugging logic
console.log('Getting all TypeScript errors...');
const allErrors = getTypeScriptErrors();
console.log(\`Total errors: \${allErrors.length}\`);

// Group by error type
const errorGroups = groupErrorsByType(allErrors);
console.log('\\nError breakdown:');
Object.entries(errorGroups)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 10)
  .forEach(([code, data]) => {
    console.log(\`  \${code}: \${data.count} - \${data.message}\`);
  });

// Find files with most errors
const fileErrorCount = {};
allErrors.forEach(error => {
  fileErrorCount[error.file] = (fileErrorCount[error.file] || 0) + 1;
});

const topErrorFiles = Object.entries(fileErrorCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

console.log('\\nTop 5 files with errors:');
topErrorFiles.forEach(([file, count]) => {
  console.log(\`  \${path.basename(file)}: \${count} errors\`);
});

// Analyze the top error file
if (topErrorFiles.length > 0) {
  const [topFile] = topErrorFiles[0];
  analyzeFile(topFile);
}

// Set breakpoint to examine data
debugger;

// Interactive debugging prompt
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function debugPrompt() {
  rl.question('\\nDebug command (file <path>, errors <type>, fix <path>, quit): ', (answer) => {
    const [command, ...args] = answer.split(' ');
    
    switch (command) {
      case 'file':
        analyzeFile(args.join(' '));
        debugPrompt();
        break;
        
      case 'errors':
        const errorType = args[0];
        if (errorGroups[errorType]) {
          console.log(\`\\n\${errorType} errors (\${errorGroups[errorType].count}):\`);
          errorGroups[errorType].examples.forEach(ex => {
            console.log(\`  \${ex.file}:\${ex.line}:\${ex.column}\`);
          });
        }
        debugPrompt();
        break;
        
      case 'fix':
        const fixPath = args.join(' ');
        console.log(\`Would fix \${fixPath} here...\`);
        debugPrompt();
        break;
        
      case 'quit':
        rl.close();
        process.exit(0);
        break;
        
      default:
        console.log('Unknown command');
        debugPrompt();
    }
  });
}

console.log('\\n🔍 Entering interactive debug mode...');
debugPrompt();
`;

// Write the debug script
fs.writeFileSync('typescript-debugger.js', debugScript);

console.log('📝 Created typescript-debugger.js');
console.log('\n🚀 Starting Node.js with inspector...');
console.log('   Opening Chrome DevTools...\n');

// Start Node with inspector
const nodeProcess = spawn('node', ['--inspect-brk', 'typescript-debugger.js'], {
  stdio: 'inherit'
});

console.log('\n📌 Chrome DevTools Instructions:');
console.log('1. Open Chrome and navigate to: chrome://inspect');
console.log('2. Click "inspect" under Remote Target');
console.log('3. The debugger will pause at the first "debugger;" statement');
console.log('4. Use Chrome DevTools to step through the code');
console.log('5. Examine variables, set breakpoints, and debug interactively\n');

// Also open in terminal for interaction
console.log('The script is also running in this terminal for interaction.\n');

nodeProcess.on('close', (code) => {
  console.log(`\nDebugger exited with code ${code}`);
  // Clean up
  fs.unlinkSync('typescript-debugger.js');
});