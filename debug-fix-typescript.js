#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Create readline interface for interactive debugging
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class InteractiveTypeScriptFixer {
  constructor() {
    this.currentFile = null;
    this.currentErrors = [];
  }

  async start() {
    console.log('🔍 Interactive TypeScript Error Debugger');
    console.log('========================================\n');
    
    // Get files with most errors
    const errorReport = this.getErrorReport();
    console.log('Files with errors (sorted by count):');
    errorReport.slice(0, 10).forEach((file, index) => {
      console.log(`${index + 1}. ${file.path} - ${file.errors} errors`);
    });
    
    debugger; // Breakpoint for Chrome DevTools
    
    // Start fixing files
    for (const fileInfo of errorReport.slice(0, 5)) {
      await this.fixFile(fileInfo.path);
    }
    
    rl.close();
  }

  getErrorReport() {
    console.log('Analyzing TypeScript errors...');
    try {
      const output = execSync('pnpm tsc --noEmit 2>&1', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      const lines = output.split('\n');
      const fileErrors = {};
      
      lines.forEach(line => {
        const match = line.match(/^(.+?)\(\d+,\d+\): error TS\d+:/);
        if (match) {
          const file = match[1];
          fileErrors[file] = (fileErrors[file] || 0) + 1;
        }
      });
      
      return Object.entries(fileErrors)
        .map(([path, errors]) => ({ path, errors }))
        .sort((a, b) => b.errors - a.errors);
    } catch (error) {
      // TypeScript will exit with error if there are compilation errors
      const output = error.stdout || error.toString();
      const lines = output.split('\n');
      const fileErrors = {};
      
      lines.forEach(line => {
        const match = line.match(/^(.+?)\(\d+,\d+\): error TS\d+:/);
        if (match) {
          const file = match[1];
          fileErrors[file] = (fileErrors[file] || 0) + 1;
        }
      });
      
      return Object.entries(fileErrors)
        .map(([path, errors]) => ({ path, errors }))
        .sort((a, b) => b.errors - a.errors);
    }
  }

  async fixFile(filePath) {
    console.log(`\n📁 Fixing ${path.basename(filePath)}...`);
    this.currentFile = filePath;
    
    // Get specific errors for this file
    this.currentErrors = this.getFileErrors(filePath);
    console.log(`Found ${this.currentErrors.length} errors`);
    
    debugger; // Breakpoint for debugging each file
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Group errors by type
    const errorGroups = this.groupErrors(this.currentErrors);
    
    // Apply fixes based on error types
    let fixedContent = content;
    
    // Fix TS1005: Punctuation expected
    if (errorGroups['TS1005']) {
      console.log(`\nFixing ${errorGroups['TS1005'].length} punctuation errors...`);
      fixedContent = this.fixPunctuationErrors(fixedContent, errorGroups['TS1005']);
    }
    
    // Fix TS1003: Identifier expected
    if (errorGroups['TS1003']) {
      console.log(`\nFixing ${errorGroups['TS1003'].length} identifier errors...`);
      fixedContent = this.fixIdentifierErrors(fixedContent, errorGroups['TS1003']);
    }
    
    // Fix TS1128: Declaration or statement expected
    if (errorGroups['TS1128']) {
      console.log(`\nFixing ${errorGroups['TS1128'].length} declaration errors...`);
      fixedContent = this.fixDeclarationErrors(fixedContent, errorGroups['TS1128']);
    }
    
    // Fix TS1109: Expression expected
    if (errorGroups['TS1109']) {
      console.log(`\nFixing ${errorGroups['TS1109'].length} expression errors...`);
      fixedContent = this.fixExpressionErrors(fixedContent, errorGroups['TS1109']);
    }
    
    // Write fixed content
    fs.writeFileSync(filePath, fixedContent);
    
    // Check if errors are reduced
    const newErrors = this.getFileErrors(filePath);
    console.log(`\n✅ Reduced errors from ${this.currentErrors.length} to ${newErrors.length}`);
    
    if (newErrors.length > 0) {
      console.log('\nRemaining errors:');
      newErrors.slice(0, 5).forEach(error => {
        console.log(`  Line ${error.line}: ${error.code} - ${error.message}`);
      });
    }
  }

  getFileErrors(filePath) {
    try {
      execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
      return [];
    } catch (error) {
      const output = error.stdout || error.toString();
      const lines = output.split('\n');
      const errors = [];
      
      lines.forEach(line => {
        const match = line.match(/^.+?\((\d+),(\d+)\): error (TS\d+): (.+)$/);
        if (match) {
          errors.push({
            line: parseInt(match[1]),
            column: parseInt(match[2]),
            code: match[3],
            message: match[4]
          });
        }
      });
      
      return errors;
    }
  }

  groupErrors(errors) {
    const groups = {};
    errors.forEach(error => {
      if (!groups[error.code]) {
        groups[error.code] = [];
      }
      groups[error.code].push(error);
    });
    return groups;
  }

  fixPunctuationErrors(content, errors) {
    const lines = content.split('\n');
    
    // Sort errors by line number in reverse order to avoid index shifting
    errors.sort((a, b) => b.line - a.line);
    
    errors.forEach(error => {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        debugger; // Breakpoint for each fix
        
        // Common patterns
        if (error.message.includes("',' expected")) {
          // Check if it's a missing comma in an object or array
          if (line.trim() && !line.trim().endsWith(',') && !line.trim().endsWith(';') && 
              !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
            const nextLine = lines[lineIndex + 1];
            if (nextLine && (nextLine.trim().startsWith('}') || nextLine.trim().match(/^\w+:/))) {
              lines[lineIndex] = line + ',';
            }
          }
        } else if (error.message.includes("';' expected")) {
          if (!line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
            lines[lineIndex] = line + ';';
          }
        } else if (error.message.includes("'}' expected")) {
          // Add closing brace
          const indent = line.match(/^\s*/)[0];
          lines.splice(lineIndex + 1, 0, indent + '}');
        }
      }
    });
    
    return lines.join('\n');
  }

  fixIdentifierErrors(content, errors) {
    const lines = content.split('\n');
    
    errors.forEach(error => {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // Fix common identifier issues
        if (line.includes('<unknown, unknown>')) {
          lines[lineIndex] = line.replace(/<unknown, unknown>/g, '');
        }
      }
    });
    
    return lines.join('\n');
  }

  fixDeclarationErrors(content, errors) {
    const lines = content.split('\n');
    
    errors.forEach(error => {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // Check for incomplete statements
        if (line.trim() === '}' || line.trim() === '};') {
          // Check if this might be an extra closing brace
          const previousNonEmptyLine = this.findPreviousNonEmptyLine(lines, lineIndex);
          if (previousNonEmptyLine && previousNonEmptyLine.trim().endsWith('};')) {
            // Remove the extra closing brace
            lines[lineIndex] = '';
          }
        }
      }
    });
    
    return lines.join('\n');
  }

  fixExpressionErrors(content, errors) {
    const lines = content.split('\n');
    
    errors.forEach(error => {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // Fix incomplete expressions
        if (line.includes('()') && !line.includes('=>') && !line.includes('function')) {
          // Might be an incomplete function call
          if (line.trim().endsWith('()')) {
            lines[lineIndex] = line + ';';
          }
        }
      }
    });
    
    return lines.join('\n');
  }

  findPreviousNonEmptyLine(lines, startIndex) {
    for (let i = startIndex - 1; i >= 0; i--) {
      if (lines[i].trim()) {
        return lines[i];
      }
    }
    return null;
  }
}

// Start the interactive debugger
const fixer = new InteractiveTypeScriptFixer();
fixer.start().catch(console.error);