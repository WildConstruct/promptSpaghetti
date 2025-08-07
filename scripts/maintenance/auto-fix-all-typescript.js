#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutomaticTypeScriptFixer {
  constructor() {
    this.totalFixed = 0;
    this.filesProcessed = 0;
  }

  async fixAllFiles() {
    console.log('🚀 Automatic TypeScript Error Fixer');
    console.log('===================================\n');
    
    // Get all TypeScript files with errors
    const filesWithErrors = this.getFilesWithErrors();
    console.log(`Found ${filesWithErrors.length} files with errors\n`);
    
    // Process files in batches
    for (const fileInfo of filesWithErrors) {
      await this.fixFile(fileInfo.path);
      this.filesProcessed++;
      
      // Show progress
      if (this.filesProcessed % 10 === 0) {
        console.log(`\n📊 Progress: ${this.filesProcessed}/${filesWithErrors.length} files processed`);
        console.log(`   Total fixes applied: ${this.totalFixed}\n`);
      }
    }
    
    console.log('\n✅ Fixing complete!');
    console.log(`   Files processed: ${this.filesProcessed}`);
    console.log(`   Total fixes applied: ${this.totalFixed}`);
  }

  getFilesWithErrors() {
    try {
      execSync('pnpm tsc --noEmit 2>&1', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
      return [];
    } catch (error) {
      const output = error.stdout || '';
      const fileErrors = new Map();
      
      output.split('\n').forEach(line => {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
        if (match) {
          const filePath = match[1];
          if (!fileErrors.has(filePath)) {
            fileErrors.set(filePath, []);
          }
          fileErrors.get(filePath).push({
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: match[4],
            message: match[5]
          });
        }
      });
      
      return Array.from(fileErrors.entries())
        .map(([path, errors]) => ({ path, errors }))
        .sort((a, b) => b.errors.length - a.errors.length);
    }
  }

  async fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    console.log(`Fixing ${path.basename(filePath)}...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    let fixes = 0;
    
    // Apply comprehensive fixes
    fixed = this.fixJestMockSyntax(fixed);
    fixed = this.fixRenderCalls(fixed);
    fixed = this.fixObjectLiterals(fixed);
    fixed = this.fixIndentation(fixed);
    fixed = this.fixMissingPunctuation(fixed);
    fixed = this.fixAsyncSyntax(fixed);
    fixed = this.fixJSXSyntax(fixed);
    fixed = this.fixTypeAnnotations(fixed);
    
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      this.totalFixed += fixes;
      
      // Check new error count
      const newErrors = this.getFileErrorCount(filePath);
      console.log(`  ✓ Applied fixes, errors reduced to ${newErrors}`);
    }
  }

  fixJestMockSyntax(content) {
    // Fix jest.fn generic syntax
    content = content.replace(/jest\.fn<[^>]+>\(\)/g, 'jest.fn()');
    
    // Fix MockedFunction syntax
    content = content.replace(/jest\.MockedFunction<any>;,/g, 'jest.MockedFunction<any>;');
    
    // Fix mock return values
    content = content.replace(/mockResolvedValue\(\[\)\s*{/g, 'mockResolvedValue([{');
    content = content.replace(/mockResolvedValue\(\{\s*\)/g, 'mockResolvedValue({');
    
    return content;
  }

  fixRenderCalls(content) {
    // Fix render() calls with JSX on next line
    content = content.replace(/render\(\);\s*\n\s*</g, 'render(\n    <');
    content = content.replace(/render\(\)\s*\n\s*</g, 'render(\n    <');
    
    // Fix render with wrong parentheses
    content = content.replace(/= render\(\)\s*\n\s*</g, '= render(\n    <');
    
    return content;
  }

  fixObjectLiterals(content) {
    const lines = content.split('\n');
    let inObject = false;
    let objectIndent = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Fix object property indentation
      if (trimmed.match(/^(metadata|defaultOptions|Position):\s*{$/)) {
        inObject = true;
        objectIndent = line.indexOf(trimmed) + 2;
      }
      
      if (inObject && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        const nextTrimmed = nextLine.trim();
        
        if (nextTrimmed && !nextTrimmed.startsWith('}')) {
          const currentIndent = nextLine.search(/\S/);
          if (currentIndent >= 0 && currentIndent < objectIndent) {
            lines[i + 1] = ' '.repeat(objectIndent) + nextTrimmed;
          }
        }
        
        if (nextTrimmed === '}' || nextTrimmed === '},') {
          inObject = false;
        }
      }
    }
    
    return lines.join('\n');
  }

  fixIndentation(content) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Fix forEach/map/filter callback indentation
      if (line.includes('.forEach(') || line.includes('.map(') || line.includes('.filter(')) {
        if (i < lines.length - 1) {
          const nextLine = lines[i + 1];
          const nextTrimmed = nextLine.trim();
          if (nextTrimmed && nextLine.search(/\S/) < line.search(/\S/)) {
            const baseIndent = line.search(/\S/);
            lines[i + 1] = ' '.repeat(baseIndent + 2) + nextTrimmed;
          }
        }
      }
    }
    
    return lines.join('\n');
  }

  fixMissingPunctuation(content) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Fix missing commas
      if (trimmed && !trimmed.endsWith(',') && !trimmed.endsWith(';') && 
          !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.endsWith('>') &&
          !trimmed.endsWith('(') && !trimmed.endsWith(')') && !trimmed.includes('//')) {
        
        if (i < lines.length - 1) {
          const nextLine = lines[i + 1].trim();
          
          // Add comma if next line is object property or array element
          if (nextLine.match(/^\w+:/) || nextLine.startsWith('{') || 
              (nextLine.startsWith('}') && !line.includes('}'))) {
            lines[i] = line + ',';
          }
        }
      }
      
      // Fix semicolon placement
      if (trimmed.endsWith('};,')) {
        lines[i] = line.replace(/};,$/g, '};');
      }
    }
    
    return lines.join('\n');
  }

  fixAsyncSyntax(content) {
    // Fix async function syntax
    content = content.replace(/async\s+\(\)\s*=>\s*{\s*\n/g, 'async () => {\n');
    
    // Fix Promise syntax
    content = content.replace(/new Promise\(resolve => resolve\)/g, 'new Promise(resolve => resolve())');
    
    return content;
  }

  fixJSXSyntax(content) {
    // Fix JSX closing tags
    content = content.replace(/\);\s*\n\s*\);/g, '\n    );');
    
    // Fix JSX prop syntax
    content = content.replace(/=\s*{}\s*}/g, '={{}}');
    
    return content;
  }

  fixTypeAnnotations(content) {
    // Fix type annotations with wrong syntax
    content = content.replace(/:\s*{\s+([^:]+):\s*([^;,}]+);/g, ': { $1: $2');
    
    // Fix 'as unknown as unknown'
    content = content.replace(/as\s+unknown\s+as\s+unknown/g, 'as unknown');
    
    return content;
  }

  getFileErrorCount(filePath) {
    try {
      execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
      return 0;
    } catch (error) {
      const output = error.stdout || '';
      return (output.match(/error TS/g) || []).length;
    }
  }
}

// Run the automatic fixer
const fixer = new AutomaticTypeScriptFixer();
fixer.fixAllFiles().catch(console.error);