#!/usr/bin/env node

/**
 * Auto-fix TypeScript Issues Script
 * Automatically fixes common TypeScript/ESLint issues that cause commit failures
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TypeScriptAutoFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      issuesFixed: 0,
      errors: []
    };
  }

  /**
   * Fix common TypeScript issues in a file
   */
  fixTypeScriptIssues(filePath, content) {
    let fixed = content;
    let changesMade = false;

    // Fix 1: Remove unused imports
    const unusedImportRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+['"][^'"]+['"];?\n/g;
    fixed = fixed.replace(unusedImportRegex, (match, imports) => {
      // Keep imports that are actually used in the file
      const importList = imports.split(',').map(imp => imp.trim());
      const usedImports = importList.filter(imp => {
        const cleanImp = imp.replace(/\s+as\s+\w+/, ''); // Remove 'as alias'
        return fixed.includes(cleanImp) && fixed.indexOf(cleanImp) !== fixed.indexOf(match);
      });
      
      if (usedImports.length === 0) {
        changesMade = true;
        return '';
      } else if (usedImports.length < importList.length) {
        changesMade = true;
        return match.replace(imports, usedImports.join(', '));
      }
      return match;
    });

    // Fix 2: Replace 'any' types with proper types in test files
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      // Common test patterns
      const anyReplacements = [
        // Mock objects
        { pattern: /as\s+any\s+as\s+jest\.Mocked<([^>]+)>/g, replacement: 'as jest.Mocked<$1>' },
        { pattern: /:\s*any\s*=\s*{([^}]+)}\s*as\s+any/g, replacement: ': unknown = {$1}' },
        
        // Function mocks
        { pattern: /jest\.fn\(\)\s*as\s+any/g, replacement: 'jest.fn()' },
        { pattern: /mockImplementation\(.*?\)\s*as\s+any/g, replacement: 'mockImplementation(() => ({}))' },
        
        // Simple any replacements for tests
        { pattern: /:\s*any(\s*[=;,)])/g, replacement: ': unknown$1' },
        { pattern: /expect\(([^)]+)\)\.toHaveProperty\('([^']+)',\s*any\)/g, replacement: 'expect($1).toHaveProperty(\'$2\', expect.anything())' }
      ];

      anyReplacements.forEach(({ pattern, replacement }) => {
        const before = fixed;
        fixed = fixed.replace(pattern, replacement);
        if (fixed !== before) changesMade = true;
      });
    }

    // Fix 3: Remove unused variables
    const unusedVarRegex = /(?:const|let|var)\s+(\w+)(?:\s*:\s*[^=]+)?\s*=\s*[^;]+;?\n(?=(?:(?!^\s*\1\b).)*$)/gm;
    fixed = fixed.replace(unusedVarRegex, (match, varName) => {
      // Check if variable is used elsewhere
      const usage = new RegExp(`\\b${varName}\\b`, 'g');
      const matches = (fixed.match(usage) || []).length;
      if (matches <= 1) { // Only declaration, no usage
        changesMade = true;
        return '';
      }
      return match;
    });

    // Fix 4: Fix line length issues by breaking long lines
    const lines = fixed.split('\n');
    const fixedLines = lines.map(line => {
      if (line.length > 120) {
        // Try to break at logical points
        if (line.includes('import {') && line.includes('} from')) {
          const importMatch = line.match(/^(\s*import\s*{\s*)([^}]+)(\s*}\s*from\s*.+)$/);
          if (importMatch) {
            const [, prefix, imports, suffix] = importMatch;
            const importList = imports.split(',').map(imp => imp.trim());
            if (importList.length > 1) {
              changesMade = true;
              return `${prefix}\n${importList.map(imp => `  ${imp}`).join(',\n')}\n${suffix}`;
            }
          }
        }
        
        // Break long function calls
        if (line.includes('(') && line.includes(')')) {
          const funcMatch = line.match(/^(\s*)(.+?)(\([^)]*\))(.*)$/);
          if (funcMatch && line.includes(',')) {
            const [, indent, beforeParen, params, afterParen] = funcMatch;
            const paramList = params.slice(1, -1).split(',').map(p => p.trim());
            if (paramList.length > 1) {
              changesMade = true;
              return `${indent}${beforeParen}(\n${paramList.map(p => `${indent}  ${p}`).join(',\n')}\n${indent})${afterParen}`;
            }
          }
        }
      }
      return line;
    });
    fixed = fixedLines.join('\n');

    // Fix 5: Add proper typing for common patterns
    const typingFixes = [
      // Mock function types
      { pattern: /jest\.fn\(\)/g, replacement: 'jest.fn<unknown[], unknown>()' },
      { pattern: /mockResolvedValue\(([^)]+)\)/g, replacement: 'mockResolvedValue($1 as unknown)' },
      { pattern: /mockReturnValue\(([^)]+)\)/g, replacement: 'mockReturnValue($1 as unknown)' }
    ];

    typingFixes.forEach(({ pattern, replacement }) => {
      const before = fixed;
      fixed = fixed.replace(pattern, replacement);
      if (fixed !== before) changesMade = true;
    });

    if (changesMade) {
      this.stats.issuesFixed++;
    }

    return { content: fixed, changed: changesMade };
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const { content: fixedContent, changed } = this.fixTypeScriptIssues(filePath, content);

      if (changed) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`✅ Fixed issues in: ${filePath}`);
      }

      this.stats.filesProcessed++;

    } catch (error) {
      this.stats.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Find and fix all TypeScript files with issues
   */
  async fixAllIssues() {
    console.log('🔧 Auto-fixing TypeScript issues...\n');

    // Find all TypeScript files that might have issues
    const filePatterns = [
      '**/*.{test,spec}.{ts,tsx}', // Test files first
      'server/src/**/*.ts',
      'packages/core/**/*.ts',
      'src/**/*.ts'
    ];

    const filesToCheck = [];

    // Use git to find staged/modified files
    try {
      const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n')
        .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
        .filter(f => f.length > 0);

      filesToCheck.push(...stagedFiles);
    } catch (error) {
      console.log('No staged files found, checking all TypeScript files...');
    }

    // If no staged files, find files with common issues
    if (filesToCheck.length === 0) {
      try {
        const allTsFiles = execSync(
          'find . -name "*.ts" -o -name "*.tsx" | grep -E "(test|spec|server/src|packages/core)" | head -20',
          { encoding: 'utf8' }
        ).split('\n').filter(f => f.length > 0);
        
        filesToCheck.push(...allTsFiles);
      } catch (error) {
        console.log('Could not find files to check');
      }
    }

    // Process each file
    for (const filePath of filesToCheck) {
      await this.processFile(filePath);
    }

    this.printSummary();
  }

  /**
   * Print summary of fixes
   */
  printSummary() {
    console.log('\n📊 Auto-fix Summary:');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Issues fixed: ${this.stats.issuesFixed}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      this.stats.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }

    if (this.stats.issuesFixed > 0) {
      console.log('\n✅ Run git add . to stage the fixes');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new TypeScriptAutoFixer();
  fixer.fixAllIssues().catch(console.error);
}

module.exports = TypeScriptAutoFixer;