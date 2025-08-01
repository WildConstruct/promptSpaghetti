#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Advanced TypeScript syntax fixer
class TypeScriptFixer {
  constructor(filePath) {
    this.filePath = filePath;
    this.content = fs.readFileSync(filePath, 'utf8');
    this.lines = this.content.split('\n');
    this.fixes = 0;
  }

  fix() {
    console.log(`\n🔧 Advanced fixing for ${path.basename(this.filePath)}...`);
    
    // Apply fixes in order
    this.fixJestMockSyntax();
    this.fixObjectLiteralIndentation();
    this.fixJSXIndentation();
    this.fixMissingClosingBraces();
    this.fixAsyncFunctionSyntax();
    this.fixTrailingCommas();
    this.fixConditionalExpressions();
    
    // Write the fixed content
    fs.writeFileSync(this.filePath, this.lines.join('\n'));
    
    // Check if errors are reduced
    return this.checkErrors();
  }

  fixJestMockSyntax() {
    // Fix jest.fn<unknown, unknown>() to jest.fn()
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].includes('jest.fn<unknown, unknown>()')) {
        this.lines[i] = this.lines[i].replace(/jest\.fn<unknown, unknown>\(\)/g, 'jest.fn()');
        this.fixes++;
      }
      // Fix jest.MockedFunction<any>;, to jest.MockedFunction<any>;
      if (this.lines[i].includes('jest.MockedFunction<any>;,')) {
        this.lines[i] = this.lines[i].replace(/jest\.MockedFunction<any>;,/g, 'jest.MockedFunction<any>;');
        this.fixes++;
      }
    }
  }

  fixObjectLiteralIndentation() {
    let inObject = false;
    let objectIndent = 0;
    
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const trimmed = line.trim();
      
      // Detect object literal start
      if (trimmed.endsWith('{') && (trimmed.includes('metadata:') || trimmed.includes('mockResolvedValue('))) {
        inObject = true;
        objectIndent = line.indexOf(trimmed) + 2;
      }
      
      // Fix indentation inside objects
      if (inObject && i > 0) {
        const prevLine = this.lines[i-1].trim();
        if (prevLine.endsWith('{') || prevLine.endsWith(',')) {
          // Check if line has wrong indentation
          const currentIndent = line.search(/\S/);
          if (currentIndent >= 0 && currentIndent < objectIndent) {
            this.lines[i] = ' '.repeat(objectIndent) + trimmed;
            this.fixes++;
          }
        }
      }
      
      // Detect object literal end
      if (inObject && (trimmed === '}' || trimmed === '},')) {
        inObject = false;
      }
    }
  }

  fixJSXIndentation() {
    let inJSX = false;
    let jsxIndent = 0;
    
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const trimmed = line.trim();
      
      // Detect JSX start
      if (trimmed.includes('render(') && i + 1 < this.lines.length) {
        const nextLine = this.lines[i + 1].trim();
        if (nextLine.startsWith('<')) {
          inJSX = true;
          jsxIndent = line.indexOf('render(') + 2;
        }
      }
      
      // Fix JSX indentation
      if (inJSX && trimmed.startsWith('<') && !trimmed.startsWith('</')) {
        const currentIndent = line.search(/\S/);
        if (currentIndent >= 0 && currentIndent < jsxIndent) {
          this.lines[i] = ' '.repeat(jsxIndent) + trimmed;
          this.fixes++;
        }
      }
      
      // Detect JSX end
      if (inJSX && trimmed.includes(');')) {
        inJSX = false;
      }
    }
  }

  fixMissingClosingBraces() {
    let braceBalance = 0;
    let parenBalance = 0;
    let inString = false;
    let inComment = false;
    
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      
      // Skip comments
      if (line.trim().startsWith('//')) continue;
      
      // Track string state
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const prevChar = j > 0 ? line[j-1] : '';
        
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          inString = !inString;
        }
        
        if (!inString) {
          if (char === '{') braceBalance++;
          if (char === '}') braceBalance--;
          if (char === '(') parenBalance++;
          if (char === ')') parenBalance--;
        }
      }
      
      // Fix common patterns
      if (line.trim() === 'as unknown as unknown);') {
        this.lines[i] = line.replace('as unknown as unknown);', '});');
        this.fixes++;
      }
      
      // Fix array closing
      if (line.trim().endsWith(']]);') && braceBalance > 0) {
        this.lines[i] = line.replace(']]);', ']);');
        this.fixes++;
      }
    }
  }

  fixAsyncFunctionSyntax() {
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const trimmed = line.trim();
      
      // Fix async arrow functions with wrong syntax
      if (trimmed.includes('async () => {') && i + 1 < this.lines.length) {
        const nextLine = this.lines[i + 1];
        if (nextLine.search(/\S/) < line.search(/\S/)) {
          // Fix indentation of function body
          const baseIndent = line.search(/\S/);
          let j = i + 1;
          while (j < this.lines.length && !this.lines[j].trim().includes('}')) {
            if (this.lines[j].trim()) {
              this.lines[j] = ' '.repeat(baseIndent + 2) + this.lines[j].trim();
              this.fixes++;
            }
            j++;
          }
        }
      }
    }
  }

  fixTrailingCommas() {
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      
      // Remove trailing commas after semicolons
      if (line.includes('};,')) {
        this.lines[i] = line.replace(/};,/g, '};');
        this.fixes++;
      }
      
      // Fix missing commas in object literals
      if (line.trim().endsWith(')') && !line.includes('=>') && i + 1 < this.lines.length) {
        const nextLine = this.lines[i + 1].trim();
        if (nextLine && !nextLine.startsWith('}') && !nextLine.startsWith(')') && 
            !nextLine.startsWith(';') && !nextLine.startsWith(',')) {
          // Likely missing comma
          if (!line.trim().endsWith(',') && !line.trim().endsWith(';')) {
            this.lines[i] = line + ',';
            this.fixes++;
          }
        }
      }
    }
  }

  fixConditionalExpressions() {
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      
      // Fix ternary operator formatting
      if (line.includes('?') && line.includes(':') && !line.includes('http')) {
        // Check if it's improperly formatted
        const questionIndex = line.indexOf('?');
        const colonIndex = line.indexOf(':', questionIndex);
        if (colonIndex > questionIndex) {
          // Ensure proper spacing
          let fixed = line;
          if (!line[questionIndex - 1].match(/\s/) && questionIndex > 0) {
            fixed = fixed.substring(0, questionIndex) + ' ' + fixed.substring(questionIndex);
          }
          if (!line[colonIndex - 1].match(/\s/) && colonIndex > 0) {
            const adjustedColonIndex = fixed.indexOf(':', questionIndex);
            fixed = fixed.substring(0, adjustedColonIndex) + ' ' + fixed.substring(adjustedColonIndex);
          }
          if (fixed !== line) {
            this.lines[i] = fixed;
            this.fixes++;
          }
        }
      }
    }
  }

  checkErrors() {
    try {
      execSync(`pnpm tsc --noEmit ${this.filePath}`, { stdio: 'pipe' });
      console.log(`✅ ${path.basename(this.filePath)} - No TypeScript errors! (${this.fixes} fixes applied)`);
      return { success: true, errors: 0, fixes: this.fixes };
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : '';
      const errorCount = (output.match(/error TS/g) || []).length;
      console.log(`⚠️  ${path.basename(this.filePath)} - Still has ${errorCount} errors (${this.fixes} fixes applied)`);
      return { success: false, errors: errorCount, fixes: this.fixes };
    }
  }
}

// Main function
async function main() {
  console.log('🚀 Advanced TypeScript Error Fixer');
  console.log('=' .repeat(50));
  
  const files = [
    'client/src/components/admin/RoleCloneManager.tsx',
    'client/src/components/admin/backup/RestoreInterface.tsx',
    'client/src/components/admin/UnifiedModerationDashboard.tsx',
    'client/src/components/admin/ApiManagementDashboard.tsx'
  ];
  
  let totalFixed = 0;
  let totalRemaining = 0;
  let totalFixes = 0;
  
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const fixer = new TypeScriptFixer(fullPath);
      const result = fixer.fix();
      
      if (result.success) {
        totalFixed++;
      } else if (result.errors > 0) {
        totalRemaining += result.errors;
      }
      totalFixes += result.fixes;
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   Files completely fixed: ${totalFixed}`);
  console.log(`   Total fixes applied: ${totalFixes}`);
  console.log(`   Remaining errors: ${totalRemaining}`);
}

// Run the script
main().catch(console.error);