#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveTypeScriptFixer {
  constructor() {
    this.filesFixed = 0;
    this.totalErrorsFixed = 0;
  }

  fixFile(filePath) {
    console.log(`\n🔧 Fixing ${path.basename(filePath)}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log('  ❌ File not found');
      return;
    }

    const beforeErrors = this.getErrorCount(filePath);
    console.log(`  📊 Errors before: ${beforeErrors}`);

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Apply comprehensive fixes
    content = this.fixInterfaceSyntax(content);
    content = this.fixArrayDeclarations(content);
    content = this.fixFunctionSyntax(content);
    content = this.fixJSXSyntax(content);
    content = this.fixObjectLiterals(content);
    content = this.fixConditionalExpressions(content);
    content = this.fixAsyncAwait(content);
    content = this.fixImportExport(content);
    content = this.removeExtraClosingBraces(content);
    content = this.fixIndentationIssues(content);

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      this.filesFixed++;
    }

    const afterErrors = this.getErrorCount(filePath);
    const fixed = beforeErrors - afterErrors;
    this.totalErrorsFixed += fixed;
    
    console.log(`  ✅ Errors after: ${afterErrors} (fixed ${fixed})`);
  }

  fixInterfaceSyntax(content) {
    // Fix interface property syntax
    content = content.replace(/(\w+)\s*:\s*(\w+[\[\]]*);,/g, '$1: $2;');
    content = content.replace(/(\w+)\s*:\s*(['"][\w\s]+['"][\s|]*)+;,/g, '$1: $2;');
    
    // Fix optional properties
    content = content.replace(/(\w+)\s*\?\s*:\s*/g, '$1?: ');
    
    // Fix interface declaration on wrong line
    content = content.replace(/\n\n+interface\s+/g, '\n\ninterface ');
    content = content.replace(/}\s*\n\s*interface\s+/g, '}\n\ninterface ');
    
    return content;
  }

  fixArrayDeclarations(content) {
    // Fix array type declarations
    content = content.replace(/:\s*(\w+)\s*\[\s*\]/g, ': $1[]');
    
    // Fix array literals with wrong syntax
    content = content.replace(/=\s*\[\s*\]\s*;/g, '= [];');
    
    // Fix multiline array declarations
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('= [') && !lines[i].includes('];')) {
        // Find the closing bracket
        let j = i + 1;
        let braceCount = 1;
        while (j < lines.length && braceCount > 0) {
          if (lines[j].includes('[')) braceCount++;
          if (lines[j].includes(']')) braceCount--;
          j++;
        }
        // Check if there's a missing semicolon
        if (j < lines.length && !lines[j-1].trim().endsWith(';')) {
          lines[j-1] = lines[j-1].trimEnd() + ';';
        }
      }
    }
    return lines.join('\n');
  }

  fixFunctionSyntax(content) {
    // Fix arrow function syntax
    content = content.replace(/=>\s*{\s*;/g, '=> {');
    content = content.replace(/}\s*;\s*}/g, '}}');
    
    // Fix function parameter syntax
    content = content.replace(/\(\s*\)\s*:\s*void\s*=>/g, '(): void =>');
    
    // Fix async function declarations
    content = content.replace(/async\s+\(\s*\)\s*=>\s*{\s*;/g, 'async () => {');
    
    return content;
  }

  fixJSXSyntax(content) {
    // Fix JSX return statements
    content = content.replace(/return\s*;\s*\n\s*</g, 'return (\n    <');
    content = content.replace(/return\s*\(\s*,/g, 'return (');
    
    // Fix JSX closing tags
    content = content.replace(/>\s*\)\s*;/g, '>\n  );');
    
    // Fix JSX props
    content = content.replace(/=\s*{\s*\(\s*\)/g, '={() => {}}');
    content = content.replace(/=\s*{\s*,/g, '={{');
    
    return content;
  }

  fixObjectLiterals(content) {
    // Fix object property syntax
    content = content.replace(/,\s*}/g, '\n  }');
    content = content.replace(/{\s*,/g, '{\n    ');
    
    // Fix style objects
    content = content.replace(/style=\{\{\s*}\s*}/g, 'style={{}}');
    content = content.replace(/style=\{\{([^}]+)}\s*}/g, 'style={{$1}}');
    
    return content;
  }

  fixConditionalExpressions(content) {
    // Fix ternary operators
    content = content.replace(/\?\s*:\s*/g, ' ? ');
    content = content.replace(/:\s*,/g, ' : ');
    
    // Fix optional chaining
    content = content.replace(/\?\.\s+/g, '?.');
    
    return content;
  }

  fixAsyncAwait(content) {
    // Fix async/await syntax
    content = content.replace(/await\s+new\s+Promise\(resolve\s+=>\s*;/g, 'await new Promise(resolve =>');
    
    // Fix try-catch blocks
    content = content.replace(/catch\s*\(\s*error\s*\)\s*{\s*;/g, 'catch (error) {');
    
    return content;
  }

  fixImportExport(content) {
    // Fix import statements
    content = content.replace(/import\s*{\s*,/g, 'import {');
    content = content.replace(/,\s*}\s*from/g, ' } from');
    
    // Fix export statements
    content = content.replace(/export\s*{\s*,/g, 'export {');
    content = content.replace(/export\s+default\s+(\w+)\s*;/g, 'export default $1;');
    
    return content;
  }

  removeExtraClosingBraces(content) {
    // Count braces to find imbalances
    const lines = content.split('\n');
    let braceCount = 0;
    const braceCounts = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let lineCount = 0;
      for (const char of line) {
        if (char === '{') lineCount++;
        if (char === '}') lineCount--;
      }
      braceCount += lineCount;
      braceCounts.push({ line: i, count: braceCount });
    }
    
    // If we end with negative brace count, remove extra closing braces from the end
    if (braceCount < 0) {
      for (let i = lines.length - 1; i >= 0 && braceCount < 0; i--) {
        if (lines[i].trim() === '}') {
          lines[i] = '';
          braceCount++;
        }
      }
    }
    
    return lines.join('\n');
  }

  fixIndentationIssues(content) {
    const lines = content.split('\n');
    let indentLevel = 0;
    const indentSize = 2;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed) continue;
      
      // Decrease indent for closing braces
      if (trimmed.startsWith('}') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Apply proper indentation
      if (line.search(/\S/) >= 0) {
        lines[i] = ' '.repeat(indentLevel * indentSize) + trimmed;
      }
      
      // Increase indent for opening braces
      if (trimmed.endsWith('{') || trimmed.endsWith('(')) {
        indentLevel++;
      }
      
      // Handle single-line closures
      const openCount = (trimmed.match(/{/g) || []).length;
      const closeCount = (trimmed.match(/}/g) || []).length;
      if (closeCount > openCount) {
        indentLevel = Math.max(0, indentLevel - (closeCount - openCount));
      }
    }
    
    return lines.join('\n');
  }

  getErrorCount(filePath) {
    try {
      execSync(`pnpm tsc --noEmit ${filePath} 2>&1`, { encoding: 'utf8' });
      return 0;
    } catch (error) {
      const output = error.stdout || '';
      return (output.match(/error TS/g) || []).length;
    }
  }

  async fixHighPriorityFiles() {
    const files = [
      'client/src/components/admin/RoleCloneManager.tsx',
      'client/src/components/admin/backup/RestoreInterface.tsx',
      'client/src/components/admin/UnifiedModerationDashboard.tsx',
      'client/src/components/admin/ApiManagementDashboard.tsx',
      'client/src/components/GraphTemplates/NodeFactory.tsx',
      'client/src/components/GraphTemplates/TemplateSelector.tsx',
      'client/src/components/BrowserSafeGraphEditor.tsx',
      'client/src/components/EnhancedGraphEditor.refactored.tsx',
      'client/src/components/EpicDashboard.tsx'
    ];

    console.log('🚀 Comprehensive TypeScript Error Fixer');
    console.log('=====================================\n');

    for (const file of files) {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        this.fixFile(fullPath);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Files fixed: ${this.filesFixed}`);
    console.log(`   Total errors fixed: ${this.totalErrorsFixed}`);
  }
}

// Run the fixer
const fixer = new ComprehensiveTypeScriptFixer();
fixer.fixHighPriorityFiles().catch(console.error);