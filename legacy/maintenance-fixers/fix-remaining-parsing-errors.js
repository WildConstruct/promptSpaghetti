#!/usr/bin/env node

/**
 * Fix Remaining Parsing Errors - Phase 2
 *
 * Addresses specific parsing errors that are still preventing linting:
 * - Object literal syntax corruption ({) -> {)
 * - Function syntax corruption ({, -> {)
 * - Interface/type syntax issues
 */

const fs = require('fs');
const path = require('path');

class RemainingParsingErrorsFixer {
  constructor() {
    this.fixCount = 0;
    this.fileCount = 0;
  }

  log(message, type = 'info') {
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[type];
    console.log(`${prefix} ${message}`);
  }

  /**
   * Apply targeted parsing fixes
   */
  applyParsingFixes(content, filePath) {
    let fixedContent = content;
    let fileFixCount = 0;

    const parsingFixes = [
      // Fix object literal opening brace corruption
      {
        pattern: /(\w+)\s*:\s*\{\)/g,
        replacement: '$1: {',
        description: 'Fix object literal opening brace {) -> {',
      },
      {
        pattern: /new\s+(\w+)\([^)]*,\s*\{\)/g,
        replacement: (match, className) => match.replace(/\{\)/, '{'),
        description: 'Fix constructor object parameter {) -> {',
      },
      // Fix function parameter object syntax
      {
        pattern: /=>\s*\{,/g,
        replacement: '=> {',
        description: 'Fix arrow function opening {, -> {',
      },
      {
        pattern: /function\s*\([^)]*\)\s*\{,/g,
        replacement: match => match.replace(/\{,/, '{'),
        description: 'Fix function opening {, -> {',
      },
      // Fix method signature issues
      {
        pattern: /(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*\{,/g,
        replacement: '$1($2): {',
        description: 'Fix method signature {, -> {',
      },
      // Fix interface/type property syntax
      {
        pattern: /interface\s+(\w+)\s*\{,/g,
        replacement: 'interface $1 {',
        description: 'Fix interface opening {, -> {',
      },
      {
        pattern: /type\s+(\w+)\s*=\s*\{,/g,
        replacement: 'type $1 = {',
        description: 'Fix type alias opening {, -> {',
      },
      // Fix object method definitions
      {
        pattern: /(\w+):\s*\([^)]*\)\s*=>\s*\{,/g,
        replacement: '$1: ($2) => {',
        description: 'Fix object method {, -> {',
      },
      // Fix JSX prop object syntax
      {
        pattern: /\s+\{\)\s*$/gm,
        replacement: ' {',
        description: 'Fix JSX prop object {) -> {',
      },
    ];

    for (const fix of parsingFixes) {
      const beforeCount = (fixedContent.match(fix.pattern) || []).length;
      if (beforeCount > 0) {
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
        const afterCount = (fixedContent.match(fix.pattern) || []).length;
        const fixesApplied = beforeCount - afterCount;
        if (fixesApplied > 0) {
          fileFixCount += fixesApplied;
          this.log(`  Applied ${fixesApplied}x: ${fix.description}`, 'info');
        }
      }
    }

    return { content: fixedContent, fixCount: fileFixCount };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const { content: fixedContent, fixCount } = this.applyParsingFixes(originalContent, filePath);

      if (fixCount > 0) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        this.log(`${path.relative(process.cwd(), filePath)}: ${fixCount} parsing fixes`, 'success');
        this.fixCount += fixCount;
        this.fileCount++;
      }
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  /**
   * Find and process files with parsing errors
   */
  async processFilesWithParsingErrors() {
    this.log('Finding files with parsing errors...', 'info');

    // Get files with parsing errors from lint output
    const { execSync } = require('child_process');

    try {
      // Run lint and capture output
      const lintOutput = execSync('pnpm lint 2>&1', {
        encoding: 'utf8',
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      // Extract file paths with parsing errors
      const lines = lintOutput.split('\n');
      const filesWithParsingErrors = new Set();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Parsing error:')) {
          // Look for the file path in previous lines
          for (let j = i - 1; j >= 0 && j >= i - 5; j--) {
            const prevLine = lines[j];
            if (prevLine.includes('.tsx') || prevLine.includes('.ts')) {
              const filePath = prevLine.trim();
              if (fs.existsSync(filePath)) {
                filesWithParsingErrors.add(filePath);
                break;
              }
            }
          }
        }
      }

      this.log(`Found ${filesWithParsingErrors.size} files with parsing errors`, 'info');

      // Process each file
      for (const filePath of filesWithParsingErrors) {
        this.processFile(filePath);
      }
    } catch (error) {
      // If lint fails, fall back to processing known problematic files
      this.log('Lint command failed, processing known problematic files...', 'warning');

      const knownProblematicFiles = [
        'client/src/__tests__/bugfix/NodeSelectionFixes.real.test.tsx',
        'client/src/components/BrowserSafeGraphEditor.tsx',
        'client/src/components/EnhancedGraphEditor.refactored.tsx',
        'client/src/components/EpicDashboard.tsx',
        'client/src/components/GraphNode.tsx',
      ];

      for (const relPath of knownProblematicFiles) {
        const fullPath = path.join(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          this.processFile(fullPath);
        }
      }
    }
  }

  /**
   * Run the parsing error fixes
   */
  async run() {
    console.log('🚀 Starting remaining parsing error fixes...\n');

    await this.processFilesWithParsingErrors();

    console.log('\n📊 Parsing Error Fix Results:');
    console.log(`  Files processed: ${this.fileCount}`);
    console.log(`  Total fixes applied: ${this.fixCount}`);

    if (this.fixCount > 0) {
      this.log('Parsing error fixes completed successfully!', 'success');
    } else {
      this.log('No parsing errors found to fix', 'info');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new RemainingParsingErrorsFixer();
  fixer.run().catch(error => {
    console.error('❌ Fix process failed:', error);
    process.exit(1);
  });
}

module.exports = RemainingParsingErrorsFixer;
